// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITimeLock Interface
 * @dev Interface for time-locked swap functionality
 */
interface ITimeLock {
    struct TimeLock {
        uint256 unlockTime;
        bool isLocked;
    }

    event SwapLocked(bytes32 indexed orderId, uint256 unlockTime);
    event SwapUnlocked(bytes32 indexed orderId);

    function lockSwap(bytes32 orderId, uint256 duration) external;
    function unlockSwap(bytes32 orderId) external;
    function getTimeLock(bytes32 orderId) external view returns (TimeLock memory);
    function isLocked(bytes32 orderId) external view returns (bool);
}