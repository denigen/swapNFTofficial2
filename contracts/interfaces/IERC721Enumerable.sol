// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC721Enumerable Interface
 * @dev Interface for an optional enumeration extension of ERC721.
 */
interface IERC721Enumerable {
    /**
     * @dev Returns the total amount of tokens stored by the contract.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns a token ID at a given index of all the tokens stored by the contract.
     */
    function tokenByIndex(uint256 index) external view returns (uint256);

    /**
     * @dev Returns a token ID owned by `owner` at a given index of its token list.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}