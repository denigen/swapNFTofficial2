// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISwapValidation Interface
 * @dev Interface for swap validation rules
 */
interface ISwapValidation {
    struct ValidationRule {
        bool isActive;
        uint256 minValue;
        uint256 maxValue;
        uint256 maxNFTsPerSwap;
        address[] allowedCollections;
    }

    event ValidationRuleCreated(bytes32 indexed ruleId);
    event ValidationRuleUpdated(bytes32 indexed ruleId);
    event ValidationRuleDisabled(bytes32 indexed ruleId);

    function createValidationRule(
        uint256 minValue,
        uint256 maxValue,
        uint256 maxNFTsPerSwap,
        address[] calldata allowedCollections
    ) external returns (bytes32);

    function updateValidationRule(
        bytes32 ruleId,
        uint256 minValue,
        uint256 maxValue,
        uint256 maxNFTsPerSwap,
        address[] calldata allowedCollections
    ) external;

    function disableValidationRule(bytes32 ruleId) external;
    function validateSwap(bytes32 orderId, bytes32 ruleId) external view returns (bool);
    function getValidationRule(bytes32 ruleId) external view returns (ValidationRule memory);
}