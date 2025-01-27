import { NetworkConfig } from '../types';

export const BNB_CONFIG: NetworkConfig = {
  chainId: 56,
  name: 'BNB Chain',
  rpcUrls: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io'
  ],
  blockExplorer: 'https://bscscan.com',
  startBlock: 5000000,
  batchSize: 3,
  requestDelay: 300
};