// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

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
        string symbol;    // ETH, APE, BNB, or HYPE
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
    event RoyaltyPaid(address indexed receiver, uint256 amount);

    constructor() Ownable(msg.sender) {}

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

        // Verify ETH payment if offering
        if (makerToken.amount > 0) {
            require(
                keccak256(bytes(makerToken.symbol)) == keccak256(bytes("ETH")),
                "Only ETH token supported"
            );
            require(msg.value == makerToken.amount, "Incorrect ETH amount sent");
            // Reserve maker's ETH until order is executed or cancelled
            reservedEth += makerToken.amount;
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

        // Validate and collect swap fee from taker
        uint256 requiredMsgValue = SWAP_FEE;
        if (order.takerToken.amount > 0) {
            require(
                keccak256(bytes(order.takerToken.symbol)) == keccak256(bytes("ETH")),
                "Only ETH token supported"
            );
            requiredMsgValue += order.takerToken.amount;
        }
        require(msg.value == requiredMsgValue, "Incorrect ETH amount");

        // Forward taker's ETH payment (excluding fee) to maker if required
        if (order.takerToken.amount > 0) {
            (bool success, ) = order.maker.call{value: order.takerToken.amount}("");
            require(success, "ETH transfer to maker failed");
        }

        // Handle maker's ETH payment
        if (order.makerToken.amount > 0) {
            require(
                keccak256(bytes(order.makerToken.symbol)) == keccak256(bytes("ETH")),
                "Only ETH token supported"
            );
            // Release reserved maker ETH to taker
            reservedEth -= order.makerToken.amount;
            // Send ETH to taker
            (bool success, ) = msg.sender.call{value: order.makerToken.amount}("");
            require(success, "ETH transfer to taker failed");
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

        // Transfer maker's NFTs to taker
        for (uint i = 0; i < order.makerNFTs.length; i++) {
            _handleTransferWithRoyalty(
                order.makerNFTs[i].contractAddress,
                order.makerNFTs[i].tokenId,
                order.maker,
                order.taker
            );
        }

        // Transfer taker's NFTs to maker
        for (uint i = 0; i < order.takerNFTs.length; i++) {
            _handleTransferWithRoyalty(
                order.takerNFTs[i].contractAddress,
                order.takerNFTs[i].tokenId,
                order.taker,
                order.maker
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
        require(msg.sender == order.maker, "Only maker can cancel");

        // Refund maker's ETH if any
        if (order.makerToken.amount > 0) {
            // Release reserved amount and refund
            reservedEth -= order.makerToken.amount;
            (bool success, ) = order.maker.call{value: order.makerToken.amount}("");
            require(success, "ETH refund failed");
        }

        order.isActive = false;
        emit SwapOrderCancelled(orderId);
    }

    /**
     * @dev Internal function to handle NFT transfer with royalty payment
     */
    function _handleTransferWithRoyalty(
        address nftContract,
        uint256 tokenId,
        address from,
        address to
    ) internal {
        // Try to handle royalties if supported
        try IERC2981(nftContract).royaltyInfo(tokenId, 0) returns (
            address receiver,
            uint256 amount
        ) {
            if (receiver != address(0) && amount > 0) {
                emit RoyaltyPaid(receiver, amount);
            }
        } catch {
            // Contract doesn't support royalties interface
        }

        // Transfer the NFT
        IERC721(nftContract).transferFrom(from, to, tokenId);
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