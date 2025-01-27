export const OPENSEA_CONFIG = {
  API_KEY: '78b1cb7a725e42d1bd753b0b9e2c0757',
  BASE_URL: 'https://api.opensea.io/api/v2',
  TESTNET_URL: 'https://testnets-api.opensea.io/api/v2'
} as const;

export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  SEPOLIA: 11155111,
  BASE: 8453
} as const;

export const CHAIN_NAMES = {
  [SUPPORTED_CHAINS.ETHEREUM]: 'ethereum',
  [SUPPORTED_CHAINS.SEPOLIA]: 'sepolia',
  [SUPPORTED_CHAINS.BASE]: 'base'
} as const;

export const OPENSEA_SUPPORTED_NETWORKS = new Set([
  SUPPORTED_CHAINS.ETHEREUM,
  SUPPORTED_CHAINS.SEPOLIA,
  SUPPORTED_CHAINS.BASE
]);