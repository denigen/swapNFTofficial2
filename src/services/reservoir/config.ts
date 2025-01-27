export const RESERVOIR_CONFIG = {
  API_KEY: '3e94d8c0-8e74-5cbc-988e-15565710d9aa',
  SUPPORTED_CHAINS: {
    APECHAIN: 33139,
    BNB: 56
  } as const,
  ENDPOINTS: {
    APECHAIN: 'https://api-apechain.reservoir.tools',
    BNB: 'https://api-bsc.reservoir.tools'
  },
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  DEFAULT_HEADERS: {
    'accept': '*/*',
    'x-api-key': '3e94d8c0-8e74-5cbc-988e-15565710d9aa'
  }
} as const;