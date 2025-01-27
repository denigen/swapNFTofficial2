// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./INFTSwap.sol";

/**
 * @title IBatchOperations Interface
 * @dev Interface for batch swap operations
 */
interface IBatchOperations {
    function createBatchSwapOrders(
        INFTSwap.NFTDetails[][] calldata makerNFTsBatch,
        INFTSwap.NFTDetails[][] calldata takerNFTsBatch,
        address[] calldata takers
    ) external returns (bytes32[] memory);

    function executeBatchSwaps(bytes32[] calldata orderIds) external;
    function cancelBatchSwaps(bytes32[] calldata orderIds) external;
}