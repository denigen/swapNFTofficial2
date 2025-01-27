export const ALCHEMY_CONFIG = {
  API_KEY: 'lMHMHq20I0fGL8kHh3_4H34E_CKlnzwT',
  BASE_URL: 'https://apechain-mainnet.g.alchemy.com/v2',
  SUPPORTED_CHAINS: {
    APECHAIN: 33139
  } as const,
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;