// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NFTSwap
 * @dev Secure peer-to-peer NFT swap contract optimized for Abstract mainnet
 * @custom:security-contact security@swapnft.xyz
 */
contract NFTSwap_ABSTRACT is ReentrancyGuard, Pausable, Ownable {
    // Structs
    struct NFTDetails {
        address contractAddress;
        uint256 tokenId;
    }

    struct TokenDetails {
        // Use "ETH" for native token; other symbols are treated as ERC20 and resolved via tokenAddresses mapping
        string symbol;
        uint256 amount;
    }

    struct SwapOrder {
        address maker;
        address taker;
        NFTDetails[] makerNFTs;
        NFTDetails[] takerNFTs;
        TokenDetails makerToken;
        TokenDetails takerToken;
        uint256 createdAt;
        bool isActive;
    }

    // State variables
    mapping(bytes32 => SwapOrder) public swapOrders;
    uint256 public constant MAX_NFTS_PER_SWAP = 20;
    uint256 public constant ORDER_EXPIRY_TIME = 7 days;
    // Configurable swap fee (denominated in wei). Default: 0.0007 ETH per executed swap
    uint256 public swapFee = 700000000000000;

    // Tracks ETH deposited by makers for active orders so owner cannot withdraw user funds
    uint256 private reservedEth;

    // ERC20 registry to support new tokens without redeploys
    mapping(string => address) public tokenAddresses;

    // Events
    event SwapOrderCreated(
        bytes32 indexed orderId,
        address indexed maker,
        address indexed taker,
        NFTDetails[] makerNFTs,
        NFTDetails[] takerNFTs,
        TokenDetails makerToken,
        TokenDetails takerToken
    );
    event SwapOrderExecuted(bytes32 indexed orderId);
    event SwapOrderCancelled(bytes32 indexed orderId);
    event SwapFeeUpdated(uint256 oldFee, uint256 newFee);

    // Custom errors for gas optimization
    error InvalidNFTCount();
    error InvalidTakerAddress();
    error SelfSwapNotAllowed();
    error TooManyNFTs();
    error NotNFTOwner();
    error NotApproved();
    error OrderNotActive();
    error NotOrderTaker();
    error OrderExpired();
    error OrderExists();
    error InvalidTokenSymbol();
    error InsufficientValue();

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Sets the token contract address for a given symbol (for ERC20 payments)
     */
    function setTokenAddress(string calldata symbol, address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        tokenAddresses[symbol] = tokenAddress;
    }

    /**
     * @dev Creates a new swap order with optional ETH payment
     */
    function createSwapOrder(
        NFTDetails[] calldata makerNFTs,
        NFTDetails[] calldata takerNFTs,
        TokenDetails calldata makerToken,
        TokenDetails calldata takerToken,
        address taker
    ) external payable whenNotPaused nonReentrant returns (bytes32) {
        if (makerNFTs.length == 0 && makerToken.amount == 0) revert InvalidNFTCount();
        if (takerNFTs.length == 0 && takerToken.amount == 0) revert InvalidNFTCount();
        if (taker == address(0)) revert InvalidTakerAddress();
        if (taker == msg.sender) revert SelfSwapNotAllowed();
        if (makerNFTs.length + takerNFTs.length > MAX_NFTS_PER_SWAP) revert TooManyNFTs();

        // Verify NFT ownership and approval
        for (uint i = 0; i < makerNFTs.length; i++) {
            address contractAddr = makerNFTs[i].contractAddress;
            uint256 tokenId = makerNFTs[i].tokenId;
            if (IERC721(contractAddr).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
            if (!IERC721(contractAddr).isApprovedForAll(msg.sender, address(this)) &&
                IERC721(contractAddr).getApproved(tokenId) != address(this)) {
                revert NotApproved();
            }
        }

        // Verify and escrow maker payment if offering
        if (makerToken.amount > 0) {
            if (keccak256(bytes(makerToken.symbol)) == keccak256(bytes("ETH"))) {
                if (msg.value != makerToken.amount) revert InsufficientValue();
                // Reserve maker's ETH until order is executed or cancelled
                reservedEth += makerToken.amount;
            } else {
                address tokenAddr = tokenAddresses[makerToken.symbol];
                if (tokenAddr == address(0)) revert InvalidTokenSymbol();
                if (msg.value != 0) revert InsufficientValue();
                // Escrow ERC20 into the contract
                require(IERC20(tokenAddr).transferFrom(msg.sender, address(this), makerToken.amount), "ERC20 escrow failed");
            }
        } else {
            if (msg.value != 0) revert InsufficientValue();
        }

        bytes32 orderId = keccak256(abi.encode(
            msg.sender,
            taker,
            block.timestamp,
            makerNFTs,
            takerNFTs,
            makerToken,
            takerToken
        ));

        if (swapOrders[orderId].isActive) revert OrderExists();

        SwapOrder storage order = swapOrders[orderId];
        order.maker = msg.sender;
        order.taker = taker;
        order.createdAt = block.timestamp;
        order.isActive = true;
        order.makerToken = makerToken;
        order.takerToken = takerToken;

        // Store NFT details
        for (uint i = 0; i < makerNFTs.length; i++) {
            order.makerNFTs.push(makerNFTs[i]);
        }
        for (uint i = 0; i < takerNFTs.length; i++) {
            order.takerNFTs.push(takerNFTs[i]);
        }

        emit SwapOrderCreated(orderId, msg.sender, taker, makerNFTs, takerNFTs, makerToken, takerToken);
        return orderId;
    }

    /**
     * @dev Executes a swap order
     */
    function executeSwap(bytes32 orderId) external payable nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        if (!order.isActive) revert OrderNotActive();
        if (msg.sender != order.taker) revert NotOrderTaker();
        if (block.timestamp > order.createdAt + ORDER_EXPIRY_TIME) revert OrderExpired();

        // Validate and collect swap fee from taker (in addition to any taker ETH payment)
        uint256 requiredMsgValue = swapFee;
        if (order.takerToken.amount > 0) {
            if (keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("ETH"))) {
                requiredMsgValue += order.takerToken.amount;
            } else {
                address takerTokenAddr = tokenAddresses[order.takerToken.symbol];
                if (takerTokenAddr == address(0)) revert InvalidTokenSymbol();
                // Collect ERC20 from taker directly to maker
                require(IERC20(takerTokenAddr).transferFrom(msg.sender, order.maker, order.takerToken.amount), "ERC20 to maker failed");
            }
        }
        if (msg.value != requiredMsgValue) revert InsufficientValue();

        // Forward taker's ETH payment (excluding fee) to maker if required
        if (order.takerToken.amount > 0 && keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("ETH"))) {
            (bool success, ) = order.maker.call{value: order.takerToken.amount}("");
            require(success, "ETH transfer to maker failed");
        }

        // Handle maker's ETH payment if required
        if (order.makerToken.amount > 0) {
            if (keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("ETH"))) {
                // Release reserved maker ETH to taker
                reservedEth -= order.makerToken.amount;
                (bool success, ) = msg.sender.call{value: order.makerToken.amount}("");
                require(success, "ETH transfer to taker failed");
            } else {
                address makerTokenAddr = tokenAddresses[order.makerToken.symbol];
                if (makerTokenAddr == address(0)) revert InvalidTokenSymbol();
                // Transfer escrowed ERC20 to taker
                require(IERC20(makerTokenAddr).transfer(msg.sender, order.makerToken.amount), "ERC20 to taker failed");
            }
        }

        // Verify and transfer NFTs
        for (uint i = 0; i < order.takerNFTs.length; i++) {
            address contractAddr = order.takerNFTs[i].contractAddress;
            uint256 tokenId = order.takerNFTs[i].tokenId;
            if (IERC721(contractAddr).ownerOf(tokenId) != msg.sender) revert NotNFTOwner();
            if (!IERC721(contractAddr).isApprovedForAll(msg.sender, address(this)) &&
                IERC721(contractAddr).getApproved(tokenId) != address(this)) {
                revert NotApproved();
            }
        }

        // Transfer maker's NFTs to taker
        for (uint i = 0; i < order.makerNFTs.length; i++) {
            IERC721(order.makerNFTs[i].contractAddress).transferFrom(
                order.maker,
                order.taker,
                order.makerNFTs[i].tokenId
            );
        }

        // Transfer taker's NFTs to maker
        for (uint i = 0; i < order.takerNFTs.length; i++) {
            IERC721(order.takerNFTs[i].contractAddress).transferFrom(
                order.taker,
                order.maker,
                order.takerNFTs[i].tokenId
            );
        }

        order.isActive = false;
        emit SwapOrderExecuted(orderId);
    }

    /**
     * @dev Cancels a swap order
     */
    function cancelSwap(bytes32 orderId) external {
        SwapOrder storage order = swapOrders[orderId];
        if (!order.isActive) revert OrderNotActive();
        if (msg.sender != order.maker && msg.sender != order.taker) revert NotOrderTaker();

        // Refund maker's payment if any
        if (order.makerToken.amount > 0) {
            if (keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("ETH"))) {
                // Release reserved amount and refund
                reservedEth -= order.makerToken.amount;
                (bool success, ) = order.maker.call{value: order.makerToken.amount}("");
                require(success, "ETH refund failed");
            } else {
                address makerTokenAddr = tokenAddresses[order.makerToken.symbol];
                if (makerTokenAddr == address(0)) revert InvalidTokenSymbol();
                require(IERC20(makerTokenAddr).transfer(order.maker, order.makerToken.amount), "ERC20 refund failed");
            }
        }

        order.isActive = false;
        emit SwapOrderCancelled(orderId);
    }

    // Owner functions
    function withdrawFees(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 available = availableFees();
        require(amount <= available, "Amount exceeds available fees");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function withdrawAllFees(address payable to) external onlyOwner {
        require(to != address(0), "Invalid address");
        uint256 amount = availableFees();
        (bool success, ) = to.call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function availableFees() public view returns (uint256) {
        uint256 bal = address(this).balance;
        if (bal <= reservedEth) return 0;
        return bal - reservedEth;
    }

    /**
     * @notice Update the swap execution fee (denominated in wei)
     */
    function setSwapFee(uint256 newFee) external onlyOwner {
        uint256 old = swapFee;
        swapFee = newFee;
        emit SwapFeeUpdated(old, newFee);
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Receive function to accept ETH payments
    receive() external payable {}
}