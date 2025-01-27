import { ContractAddresses } from '../types';

export const BASE_CONTRACTS: ContractAddresses = {
  NFT_SWAP: '0xe1053fb2d21e7dff3b024ddd9898032864cf4697'
} as const;

// Chain configuration
export const BASE_CHAIN_CONFIG = {
  chainId: 8453,
  name: 'Base',
  rpcUrls: [
    'https://mainnet.base.org',
    'https://base.blockpi.network/v1/rpc/public',
    'https://1rpc.io/base'
  ],
  blockExplorer: 'https://basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
} as const;