export const OKX_CONFIG = {
  API_KEY: 'bb02af58-c6b2-4f05-831e-82c2553649cf',
  BASE_URL: 'https://www.okx.com/api/v5',
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  SUPPORTED_CHAINS: {
    APECHAIN: 33139
  } as const,
  DEFAULT_HEADERS: {
    'accept': 'application/json',
    'ok-access-key': 'bb02af58-c6b2-4f05-831e-82c2553649cf'
  }
} as const;