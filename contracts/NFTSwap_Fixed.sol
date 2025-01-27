// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract NFTSwap_Fixed is ReentrancyGuard, Pausable, Ownable {
    // Structs
    struct NFTDetails {
        address contractAddress;
        uint256 tokenId;
    }

    struct SwapOrder {
        address maker;
        address taker;
        NFTDetails[] makerNFTs;
        NFTDetails[] takerNFTs;
        uint256 createdAt;
        bool isActive;
    }

    // State variables
    mapping(bytes32 => SwapOrder) public swapOrders;
    uint256 public constant MAX_NFTS_PER_SWAP = 20;

    // Events
    event SwapOrderCreated(
        bytes32 indexed orderId,
        address indexed maker,
        address indexed taker,
        NFTDetails[] makerNFTs,
        NFTDetails[] takerNFTs
    );
    event SwapOrderExecuted(bytes32 indexed orderId);
    event SwapOrderCancelled(bytes32 indexed orderId);
    event RoyaltyPaid(address indexed receiver, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createSwapOrder(
        NFTDetails[] calldata makerNFTs,
        NFTDetails[] calldata takerNFTs,
        address taker
    ) external whenNotPaused nonReentrant returns (bytes32) {
        require(makerNFTs.length > 0, "Must offer at least one NFT");
        require(takerNFTs.length > 0, "Must request at least one NFT");
        require(taker != address(0), "Invalid taker address");
        require(taker != msg.sender, "Cannot create swap with yourself");
        require(
            makerNFTs.length + takerNFTs.length <= MAX_NFTS_PER_SWAP,
            "Too many NFTs in swap"
        );

        // Verify ownership and approval
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

        bytes32 orderId = keccak256(abi.encode(
            msg.sender,
            taker,
            block.timestamp,
            makerNFTs,
            takerNFTs
        ));

        require(!swapOrders[orderId].isActive, "Order ID already exists");

        SwapOrder storage order = swapOrders[orderId];
        order.maker = msg.sender;
        order.taker = taker;
        order.createdAt = block.timestamp;
        order.isActive = true;

        // Store NFT details
        for (uint i = 0; i < makerNFTs.length; i++) {
            order.makerNFTs.push(makerNFTs[i]);
        }
        for (uint i = 0; i < takerNFTs.length; i++) {
            order.takerNFTs.push(takerNFTs[i]);
        }

        emit SwapOrderCreated(orderId, msg.sender, taker, makerNFTs, takerNFTs);
        return orderId;
    }

    function executeSwap(bytes32 orderId) external nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "Order not active");
        require(msg.sender == order.taker, "Only taker can execute");

        // Verify taker's NFTs and approvals
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

    function cancelSwap(bytes32 orderId) external {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "Order not active");
        require(msg.sender == order.maker, "Only maker can cancel");

        order.isActive = false;
        emit SwapOrderCancelled(orderId);
    }

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
}