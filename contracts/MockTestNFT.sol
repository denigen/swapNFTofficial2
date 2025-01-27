// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockTestNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Mock Test NFT", "MOCK") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    function mint() public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    function mintBatch(uint256 amount) public {
        for(uint256 i = 0; i < amount; i++) {
            mint();
        }
    }
}