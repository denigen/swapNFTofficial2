import { NetworkConfig } from '../types';

export const APECHAIN_CONFIG: NetworkConfig = {
  chainId: 33139,
  name: 'ApeChain',
  rpcUrls: [
    'https://rpc.apechain.com/http'
  ],
  blockExplorer: '',
  startBlock: 1,
  batchSize: 3,
  requestDelay: 300,
  nativeCurrency: {
    name: 'APE',
    symbol: 'APE',
    decimals: 18
  }
};