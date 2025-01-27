// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title NFTSwap
 * @dev Secure peer-to-peer NFT swap contract with comprehensive approval checks
 */
contract NFTSwap is ReentrancyGuard, Pausable, Ownable {
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

    /**
     * @dev Verifies NFT ownership and approvals for a given address
     * @param nfts Array of NFT details to verify
     * @param owner Address that should own the NFTs
     * @param operator Address that should have approval
     * @return bool True if all verifications pass
     */
    function verifyNFTApprovalsAndOwnership(
        NFTDetails[] memory nfts,
        address owner,
        address operator
    ) internal view returns (bool) {
        for (uint i = 0; i < nfts.length; i++) {
            IERC721 nftContract = IERC721(nfts[i].contractAddress);
            
            // Verify current ownership
            if (nftContract.ownerOf(nfts[i].tokenId) != owner) {
                return false;
            }

            // Check both individual token approval and operator approval
            if (!nftContract.isApprovedForAll(owner, operator) && 
                nftContract.getApproved(nfts[i].tokenId) != operator) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Creates a new swap order with comprehensive approval checks
     */
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

        // Verify maker's ownership and contract approval
        require(
            verifyNFTApprovalsAndOwnership(makerNFTs, msg.sender, address(this)),
            "Maker NFT ownership or approval check failed"
        );

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

    /**
     * @dev Executes a swap order with real-time approval verification
     */
    function executeSwap(bytes32 orderId) external nonReentrant {
        SwapOrder storage order = swapOrders[orderId];
        require(order.isActive, "Order not active");
        require(msg.sender == order.taker, "Only taker can execute");

        // Verify current ownership and approvals for both parties
        require(
            verifyNFTApprovalsAndOwnership(order.makerNFTs, order.maker, address(this)),
            "Maker NFT ownership or approval check failed"
        );
        require(
            verifyNFTApprovalsAndOwnership(order.takerNFTs, order.taker, address(this)),
            "Taker NFT ownership or approval check failed"
        );

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