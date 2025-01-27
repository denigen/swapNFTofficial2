// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC721Base.sol";
import "./IERC721Metadata.sol";
import "./IERC721Enumerable.sol";

/**
 * @title IERC721 Interface
 * @dev Combined interface including base, metadata and enumerable functionality
 */
interface IERC721 is IERC721Base, IERC721Metadata, IERC721Enumerable {
    // Combined interface of ERC721 functionality
}