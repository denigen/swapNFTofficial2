// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC721Metadata Interface
 * @dev Interface for the optional metadata functions from the ERC721 standard.
 */
interface IERC721Metadata {
    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}