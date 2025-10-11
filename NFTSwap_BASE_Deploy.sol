// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NFTSwap
 * @dev Secure peer-to-peer NFT swap contract optimized for BASE mainnet with ETH payments
 */
contract NFTSwap_BASE is ReentrancyGuard, Pausable, Ownable {
    // Structs
    struct NFTDetails {
        address contractAddress;
        uint256 tokenId;
    }

    struct TokenDetails {
        // Symbol for token. Use "ETH" for native; any other symbol is treated as ERC20 and resolved via tokenAddresses mapping
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
    uint256 public constant SWAP_FEE = 700000000000000; // 0.0007 ETH fee per executed swap

    // Tracks ETH deposited by makers for active orders so owner cannot withdraw user funds
    uint256 private reservedEth;

    // ERC20 registry to support future tokens without redeploy
    mapping(string => address) public tokenAddresses;

    // Fee whitelist: addresses or NFT collections that waive swap fees
    mapping(address => bool) private feeWhitelistAddresses;
    mapping(address => bool) private feeWhitelistCollections;

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
    // No royalty handling on BASE

    // Whitelist events
    event FeeWhitelistAddressUpdated(address indexed account, bool isWhitelisted);
    event FeeWhitelistCollectionUpdated(address indexed collection, bool isWhitelisted);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Sets the token contract address for a given symbol (for ERC20 payments)
     */
    function setTokenAddress(string calldata symbol, address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        tokenAddresses[symbol] = tokenAddress;
    }

    /**
     * @dev Adds or removes an address from the fee whitelist
     */
    function setFeeWhitelistAddress(address account, bool isWhitelisted) external onlyOwner {
        require(account != address(0), "Invalid address");
        feeWhitelistAddresses[account] = isWhitelisted;
        emit FeeWhitelistAddressUpdated(account, isWhitelisted);
    }

    /**
     * @dev Adds or removes an NFT collection from the fee whitelist
     */
    function setFeeWhitelistCollection(address collection, bool isWhitelisted) external onlyOwner {
        require(collection != address(0), "Invalid collection");
        feeWhitelistCollections[collection] = isWhitelisted;
        emit FeeWhitelistCollectionUpdated(collection, isWhitelisted);
    }

    /**
     * @dev View helper to check if an address is fee-whitelisted
     */
    function isAddressWhitelistedForFee(address account) external view returns (bool) {
        return feeWhitelistAddresses[account];
    }

    /**
     * @dev View helper to check if a collection is fee-whitelisted
     */
    function isCollectionWhitelistedForFee(address collection) external view returns (bool) {
        return feeWhitelistCollections[collection];
    }

    /**
     * @dev Internal helper to determine if the swap fee is waived for a given order
     *      Waives if either participant is whitelisted or any involved NFT collection is whitelisted
     */
    function isFeeWaivedForOrder(SwapOrder storage order) internal view returns (bool) {
        if (feeWhitelistAddresses[order.maker] || feeWhitelistAddresses[order.taker]) {
            return true;
        }
        for (uint i = 0; i < order.makerNFTs.length; i++) {
            if (feeWhitelistCollections[order.makerNFTs[i].contractAddress]) {
                return true;
            }
        }
        for (uint j = 0; j < order.takerNFTs.length; j++) {
            if (feeWhitelistCollections[order.takerNFTs[j].contractAddress]) {
                return true;
            }
        }
        return false;
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
        require(makerNFTs.length > 0 || makerToken.amount > 0, "Must offer NFTs or ETH");
        require(takerNFTs.length > 0 || takerToken.amount > 0, "Must request NFTs or ETH");
        require(taker != address(0), "Invalid taker address");
        require(taker != msg.sender, "Cannot create swap with yourself");
        require(
            makerNFTs.length + takerNFTs.length <= MAX_NFTS_PER_SWAP,
            "Too many NFTs in swap"
        );

        // Verify NFT ownership and approval
        for (uint i = 0; i < makerNFTs.length; i++) {
            address contractAddr = makerNFTs[i].contractAddress;
            uint256 tokenId = makerNFTs[i].tokenId;
            require(
                IERC721(contractAddr).ownerOf(tokenId) == msg.sender,
                "Must own offered NFTs"
            );
            require(
                IERC721(contractAddr).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(contractAddr).getApproved(tokenId) == address(this),
                "Contract must be approved"
            );
        }

        // Verify and escrow maker payment if offering
        if (makerToken.amount > 0) {
            if (keccak256(bytes(makerToken.symbol)) == keccak256(bytes("ETH"))) {
                require(msg.value == makerToken.amount, "Incorrect ETH amount sent");
                // Reserve maker's ETH until order is executed or cancelled
                reservedEth += makerToken.amount;
            } else {
                address tokenAddr = tokenAddresses[makerToken.symbol];
                require(tokenAddr != address(0), "Unsupported token symbol");
                require(msg.value == 0, "ETH not expected for ERC20");
                // Escrow ERC20 in the contract
                require(IERC20(tokenAddr).transferFrom(msg.sender, address(this), makerToken.amount), "ERC20 escrow failed");
            }
        } else {
            require(msg.value == 0, "Unexpected ETH sent");
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

        require(!swapOrders[orderId].isActive, "Order ID already exists");

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
        require(order.isActive, "Order not active");
        require(msg.sender == order.taker, "Only taker can execute");
        require(
            block.timestamp <= order.createdAt + ORDER_EXPIRY_TIME,
            "Order expired"
        );

        // Validate and collect swap fee from taker (waived if whitelisted)
        uint256 fee = isFeeWaivedForOrder(order) ? 0 : SWAP_FEE;
        uint256 requiredMsgValue = fee;
        if (order.takerToken.amount > 0) {
            if (keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("ETH"))) {
                requiredMsgValue += order.takerToken.amount;
            } else {
                address takerTokenAddr = tokenAddresses[order.takerToken.symbol];
                require(takerTokenAddr != address(0), "Unsupported token symbol");
                // Collect ERC20 from taker directly to maker
                require(IERC20(takerTokenAddr).transferFrom(msg.sender, order.maker, order.takerToken.amount), "ERC20 to maker failed");
            }
        }
        require(msg.value == requiredMsgValue, "Incorrect ETH amount");

        // Forward taker's ETH payment (excluding fee) to maker if required
        if (order.takerToken.amount > 0 && keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("ETH"))) {
            (bool success, ) = order.maker.call{value: order.takerToken.amount}("");
            require(success, "ETH transfer to maker failed");
        }

        // Handle maker's payment payout
        if (order.makerToken.amount > 0) {
            if (keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("ETH"))) {
                // Release reserved maker ETH to taker
                reservedEth -= order.makerToken.amount;
                (bool success, ) = msg.sender.call{value: order.makerToken.amount}("");
                require(success, "ETH transfer to taker failed");
            } else {
                address makerTokenAddr = tokenAddresses[order.makerToken.symbol];
                require(makerTokenAddr != address(0), "Unsupported token symbol");
                // Transfer escrowed ERC20 to taker
                require(IERC20(makerTokenAddr).transfer(msg.sender, order.makerToken.amount), "ERC20 to taker failed");
            }
        }

        // Verify and transfer NFTs
        for (uint i = 0; i < order.takerNFTs.length; i++) {
            address contractAddr = order.takerNFTs[i].contractAddress;
            uint256 tokenId = order.takerNFTs[i].tokenId;
            require(
                IERC721(contractAddr).ownerOf(tokenId) == msg.sender,
                "Must own offered NFTs"
            );
            require(
                IERC721(contractAddr).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(contractAddr).getApproved(tokenId) == address(this),
                "Contract must be approved"
            );
        }

        // Transfer maker's NFTs to taker (no royalty handling)
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
        require(order.isActive, "Order not active");
        require(msg.sender == order.maker || msg.sender == order.taker, "Only maker or taker can cancel");

        // Refund maker's payment if any
        if (order.makerToken.amount > 0) {
            if (keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("ETH"))) {
                reservedEth -= order.makerToken.amount;
                (bool success, ) = order.maker.call{value: order.makerToken.amount}("");
                require(success, "ETH refund failed");
            } else {
                address makerTokenAddr = tokenAddresses[order.makerToken.symbol];
                require(makerTokenAddr != address(0), "Unsupported token symbol");
                require(IERC20(makerTokenAddr).transfer(order.maker, order.makerToken.amount), "ERC20 refund failed");
            }
        }

        order.isActive = false;
        emit SwapOrderCancelled(orderId);
    }

    // No royalty helper

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Receive function to accept ETH payments
    receive() external payable {}

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
}