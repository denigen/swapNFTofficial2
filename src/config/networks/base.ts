export const BASE_CONFIG = {
  chainId: 8453,
  name: 'Base',
  rpcUrls: [
    'https://mainnet.base.org',
    'https://base.blockpi.network/v1/rpc/public',
    'https://1rpc.io/base'
  ],
  blockExplorer: 'https://basescan.org',
  startBlock: 1, // Base mainnet genesis block
  batchSize: 3, // Smaller batch size for Base RPC stability
  requestDelay: 300 // Delay between requests in ms
} as const;