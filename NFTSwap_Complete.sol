// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// NFT Swap Interface
interface INFTSwap {
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

    event SwapOrderCreated(
        bytes32 indexed orderId,
        address indexed maker,
        address indexed taker,
        NFTDetails[] makerNFTs,
        NFTDetails[] takerNFTs
    );
    
    event SwapOrderExecuted(bytes32 indexed orderId);
    event SwapOrderCancelled(bytes32 indexed orderId);
}

// Marketplace Interface
interface IMarketplace {
    struct Fee {
        address recipient;
        uint256 percentage;
    }
    
    event FeeUpdated(address recipient, uint256 percentage);
    event FeeCollected(address recipient, uint256 amount);
}

// Escrow Interface
interface IEscrow {
    struct EscrowDetails {
        address arbiter;
        bool isApproved;
        uint256 deadline;
        string disputeReason;
    }

    event EscrowCreated(bytes32 indexed orderId, address indexed arbiter, uint256 deadline);
    event EscrowApproved(bytes32 indexed orderId);
    event EscrowDisputed(bytes32 indexed orderId, string reason);
    event EscrowResolved(bytes32 indexed orderId, bool approved);
}

// ERC721 Interface
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

// Main Contract
contract NFTSwap is INFTSwap, IMarketplace, IEscrow, ReentrancyGuard, Pausable, Ownable {
    // State variables
    mapping(bytes32 => SwapOrder) public swapOrders;
    mapping(bytes32 => EscrowDetails) public escrows;
    mapping(address => Fee) public fees;
    uint256 public constant MAX_FEE = 1000; // 10% max fee (basis points)

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

        // Verify ownership and approval
        for (uint i = 0; i < makerNFTs.length; i++) {
            address contractAddr = makerNFTs[i].contractAddress;
            uint256 tokenId = makerNFTs[i].tokenId;
            require(IERC721(contractAddr).ownerOf(tokenId) == msg.sender, "Must own offered NFTs");
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

        swapOrders[orderId] = SwapOrder({
            maker: msg.sender,
            taker: taker,
            makerNFTs: makerNFTs,
            takerNFTs: takerNFTs,
            createdAt: block.timestamp,
            isActive: true
        });

        emit SwapOrderCreated(orderId, msg.sender, taker, makerNFTs, takerNFTs);
        return orderId;
    }

    function executeSwap(bytes32 orderId) external nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "Order not active");
        require(msg.sender == order.taker, "Only taker can execute");

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

    function cancelSwap(bytes32 orderId) external {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "Order not active");
        require(msg.sender == order.maker, "Only maker can cancel");

        order.isActive = false;
        emit SwapOrderCancelled(orderId);
    }

    function setFee(address recipient, uint256 percentage) external onlyOwner {
        require(percentage <= MAX_FEE, "Fee too high");
        fees[recipient] = Fee(recipient, percentage);
        emit FeeUpdated(recipient, percentage);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}