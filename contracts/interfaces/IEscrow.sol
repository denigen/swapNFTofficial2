// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEscrow Interface
 * @dev Interface for escrow functionality in swaps
 */
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

    function createEscrowedSwap(
        address arbiter,
        uint256 deadline
    ) external returns (bytes32);

    function approveEscrow(bytes32 orderId) external;
    function disputeEscrow(bytes32 orderId, string calldata reason) external;
    function resolveDispute(bytes32 orderId, bool approved) external;
    function getEscrowDetails(bytes32 orderId) external view returns (EscrowDetails memory);
}