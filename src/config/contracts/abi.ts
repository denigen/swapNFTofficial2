// Centralized ABI definitions
export const SWAP_ABI = [
  'function createSwapOrder(tuple(address contractAddress, uint256 tokenId)[] fromNFTs, tuple(address contractAddress, uint256 tokenId)[] toNFTs, address counterparty) external returns (bytes32)',
  'function executeSwap(bytes32 orderId) external',
  'function cancelSwap(bytes32 orderId) external',
  'function getSwapOrder(bytes32 orderId) external view returns (address maker, address taker, tuple(address contractAddress, uint256 tokenId)[] makerNFTs, tuple(address contractAddress, uint256 tokenId)[] takerNFTs, uint256 createdAt, bool isActive)',
  'event SwapOrderCreated(bytes32 indexed orderId, address indexed maker, address indexed taker, tuple(address contractAddress, uint256 tokenId)[] makerNFTs, tuple(address contractAddress, uint256 tokenId)[] takerNFTs)',
  'event SwapOrderExecuted(bytes32 indexed orderId)',
  'event SwapOrderCancelled(bytes32 indexed orderId)'
];

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