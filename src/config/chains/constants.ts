export const CHAIN_IDS = {
  BASE: 8453,
  APECHAIN: 33139
} as const;

export const RPC_CONFIG = {
  BASE: {
    urls: [
      'https://mainnet.base.org',
      'https://base.blockpi.network/v1/rpc/public',
      'https://1rpc.io/base'
    ],
    blockExplorer: 'https://basescan.org'
  },
  APECHAIN: {
    urls: ['https://rpc.apechain.com'],
    blockExplorer: ''
  }
} as const;