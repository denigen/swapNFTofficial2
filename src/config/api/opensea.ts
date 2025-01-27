export const OPENSEA_CONFIG = {
  API_KEY: '78b1cb7a725e42d1bd753b0b9e2c0757',
  BASE_URL: 'https://api.opensea.io/api/v2',
  TESTNET_URL: 'https://testnets-api.opensea.io/api/v2',
  SUPPORTED_CHAINS: {
    ETHEREUM: 1,
    SEPOLIA: 11155111,
    BASE: 8453
  } as const,
  CHAIN_NAMES: {
    1: 'ethereum',
    11155111: 'sepolia',
    8453: 'base'
  } as const
} as const;

export const OPENSEA_SUPPORTED_NETWORKS = new Set([
  OPENSEA_CONFIG.SUPPORTED_CHAINS.ETHEREUM,
  OPENSEA_CONFIG.SUPPORTED_CHAINS.SEPOLIA,
  OPENSEA_CONFIG.SUPPORTED_CHAINS.BASE
]);