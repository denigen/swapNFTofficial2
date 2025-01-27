// Swap contract ABI definition
export const SWAP_ABI = [
  'function createSwapOrder(tuple(address contractAddress, uint256 tokenId)[] fromNFTs, tuple(address contractAddress, uint256 tokenId)[] toNFTs, address counterparty) external returns (bytes32)',
  'function executeSwap(bytes32 orderId) external',
  'function cancelSwap(bytes32 orderId) external',
  'function getSwapOrder(bytes32 orderId) external view returns (address maker, address taker, tuple(address contractAddress, uint256 tokenId)[] makerNFTs, tuple(address contractAddress, uint256 tokenId)[] takerNFTs, uint256 createdAt, bool isActive)',
  'event SwapOrderCreated(bytes32 indexed orderId, address indexed maker, address indexed taker, tuple(address contractAddress, uint256 tokenId)[] makerNFTs, tuple(address contractAddress, uint256 tokenId)[] takerNFTs)',
  'event SwapOrderExecuted(bytes32 indexed orderId)',
  'event SwapOrderCancelled(bytes32 indexed orderId)'
];