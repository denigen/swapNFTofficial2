// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC2981 Interface
 * @dev Interface for the NFT Royalty Standard
 */
interface IERC2981 {
    /**
     * @dev Returns how much royalty is owed and to whom, based on a sale price that may be denominated in any unit of
     * exchange. The royalty amount is denominated in the same unit of exchange.
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount);

    /**
     * @dev Returns true if this contract implements the interface defined by interfaceId.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}