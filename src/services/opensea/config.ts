export const OPENSEA_CONFIG = {
  API_KEY: import.meta.env.VITE_OPENSEA_API_KEY,
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
  } as const,
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  DEFAULT_HEADERS: {
    'Accept': 'application/json'
  }
} as const;

export const CHAIN_NAMES = OPENSEA_CONFIG.CHAIN_NAMES;
export const OPENSEA_SUPPORTED_NETWORKS = new Set(Object.values(OPENSEA_CONFIG.SUPPORTED_CHAINS));