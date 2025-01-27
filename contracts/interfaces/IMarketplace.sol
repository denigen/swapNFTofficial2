// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMarketplace Interface
 * @dev Interface for marketplace functionality
 */
interface IMarketplace {
    struct Fee {
        address recipient;
        uint256 percentage;
    }
    
    event FeeUpdated(address recipient, uint256 percentage);
    event FeeCollected(address recipient, uint256 amount);
    
    function setFee(address recipient, uint256 percentage) external;
    function getFee(address token) external view returns (Fee memory);
    function withdrawFees(address token) external;
}