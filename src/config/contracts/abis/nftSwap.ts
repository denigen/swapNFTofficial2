export const NFT_SWAP_ABI = [
  // Read functions
  'function swapOrders(bytes32) view returns (address maker, address taker, uint256 createdAt, bool isActive)',
  
  // Write functions
  'function createSwapOrder(tuple(address contractAddress, uint256 tokenId)[] makerNFTs, tuple(address contractAddress, uint256 tokenId)[] takerNFTs, address taker) external returns (bytes32)',
  'function executeSwap(bytes32 orderId) external',
  'function cancelSwap(bytes32 orderId) external',
  
  // Events
  'event SwapOrderCreated(bytes32 indexed orderId, address indexed maker, address indexed taker, tuple(address contractAddress, uint256 tokenId)[] makerNFTs, tuple(address contractAddress, uint256 tokenId)[] takerNFTs)',
  'event SwapOrderExecuted(bytes32 indexed orderId)',
  'event SwapOrderCancelled(bytes32 indexed orderId)',
  'event RoyaltyPaid(address indexed receiver, uint256 amount)'
] as const;