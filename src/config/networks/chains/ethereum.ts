import { NetworkConfig } from '../types';

export const ETHEREUM_CONFIG: NetworkConfig = {
  chainId: 1,
  name: 'Ethereum',
  rpcUrls: [
    'https://eth-mainnet.g.alchemy.com/v2/demo',
    'https://rpc.ankr.com/eth'
  ],
  blockExplorer: 'https://etherscan.io',
  startBlock: 12000000,
  batchSize: 5,
  requestDelay: 200
};