import { Chain } from '../types/chain';

// Deployed contract addresses
export const SWAP_CONTRACT_ADDRESSES: Record<number, string> = {
  11155111: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' // Sepolia testnet
};

// Known NFT contracts to always check
export const KNOWN_NFT_CONTRACTS: Record<number, string[]> = {
  11155111: [
    '0xC84f1Ce11673A57ce8287564201badb7E1De6f99' // Specific NFT contract on Sepolia
  ]
};

export const NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function getApproved(uint256 tokenId) view returns (address)'
];