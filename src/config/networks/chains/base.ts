import { NetworkConfig } from '../types';

export const BASE_CONFIG: NetworkConfig = {
  chainId: 8453,
  name: 'Base',
  rpcUrls: [
    'https://mainnet.base.org',
    'https://base.blockpi.network/v1/rpc/public',
    'https://1rpc.io/base'
  ],
  blockExplorer: 'https://basescan.org',
  startBlock: 1,
  batchSize: 3,
  requestDelay: 300
};