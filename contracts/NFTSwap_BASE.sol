// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title NFTSwap
 * @dev Secure peer-to-peer NFT swap contract optimized for BASE mainnet
 * @custom:security-contact security@nftswap.com
 */
contract NFTSwap_BASE is ReentrancyGuard, Pausable, Ownable {
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
    uint256 public constant ORDER_EXPIRY_TIME = 7 days;

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

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new swap order
     * @param makerNFTs Array of NFTs offered by the maker
     * @param takerNFTs Array of NFTs requested from the taker
     * @param taker Address of the intended taker
     */
    function createSwapOrder(
        NFTDetails[] calldata makerNFTs,
        NFTDetails[] calldata takerNFTs,
        address taker
    ) external whenNotPaused nonReentrant returns (bytes32) {
        // Input validation
        if (makerNFTs.length == 0 || takerNFTs.length == 0) revert InvalidNFTCount();
        if (taker == address(0)) revert InvalidTakerAddress();
        if (taker == msg.sender) revert SelfSwapNotAllowed();
        if (makerNFTs.length + takerNFTs.length > MAX_NFTS_PER_SWAP) revert TooManyNFTs();

        // Verify ownership and approval
        for (uint i = 0; i < makerNFTs.length; i++) {
            IERC721 nftContract = IERC721(makerNFTs[i].contractAddress);
            if (nftContract.ownerOf(makerNFTs[i].tokenId) != msg.sender) revert NotNFTOwner();
            if (!nftContract.isApprovedForAll(msg.sender, address(this)) &&
                nftContract.getApproved(makerNFTs[i].tokenId) != address(this)) {
                revert NotApproved();
            }
        }

        bytes32 orderId = keccak256(abi.encode(
            msg.sender,
            taker,
            block.timestamp,
            makerNFTs,
            takerNFTs
        ));

        if (swapOrders[orderId].isActive) revert OrderExists();

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

    /**
     * @dev Executes a swap order
     * @param orderId The ID of the swap order to execute
     */
    function executeSwap(bytes32 orderId) external nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        if (!order.isActive) revert OrderNotActive();
        if (msg.sender != order.taker) revert NotOrderTaker();
        if (block.timestamp > order.createdAt + ORDER_EXPIRY_TIME) revert OrderExpired();

        // Verify taker's NFT ownership and approvals
        for (uint i = 0; i < order.takerNFTs.length; i++) {
            IERC721 nftContract = IERC721(order.takerNFTs[i].contractAddress);
            if (nftContract.ownerOf(order.takerNFTs[i].tokenId) != msg.sender) revert NotNFTOwner();
            if (!nftContract.isApprovedForAll(msg.sender, address(this)) &&
                nftContract.getApproved(order.takerNFTs[i].tokenId) != address(this)) {
                revert NotApproved();
            }
        }

        // Verify maker's NFT ownership and approvals
        for (uint i = 0; i < order.makerNFTs.length; i++) {
            IERC721 nftContract = IERC721(order.makerNFTs[i].contractAddress);
            if (nftContract.ownerOf(order.makerNFTs[i].tokenId) != order.maker) revert NotNFTOwner();
            if (!nftContract.isApprovedForAll(order.maker, address(this)) &&
                nftContract.getApproved(order.makerNFTs[i].tokenId) != address(this)) {
                revert NotApproved();
            }
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
     * @param orderId The ID of the swap order to cancel
     */
    function cancelSwap(bytes32 orderId) external {
        SwapOrder storage order = swapOrders[orderId];
        if (!order.isActive) revert OrderNotActive();
        if (msg.sender != order.maker) revert NotOrderTaker();

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
}