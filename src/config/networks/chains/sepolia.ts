import { NetworkConfig } from '../types';

export const SEPOLIA_CONFIG: NetworkConfig = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrls: [
    'https://eth-sepolia.g.alchemy.com/v2/demo',
    'https://rpc.sepolia.org'
  ],
  blockExplorer: 'https://sepolia.etherscan.io',
  startBlock: 2800000,
  batchSize: 5,
  requestDelay: 200
};