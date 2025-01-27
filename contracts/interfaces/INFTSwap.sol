// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    function createSwapOrder(
        NFTDetails[] calldata makerNFTs,
        NFTDetails[] calldata takerNFTs,
        address taker
    ) external returns (bytes32);

    function executeSwap(bytes32 orderId) external;
    function cancelSwap(bytes32 orderId) external;
}