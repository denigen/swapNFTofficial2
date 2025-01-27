export const OPENSEA_CONFIG = {
  API_KEY: '78b1cb7a725e42d1bd753b0b9e2c0757',
  BASE_URL: 'https://api.opensea.io/api/v2',
  TESTNET_URL: 'https://testnets-api.opensea.io/api/v2',
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_BATCH_SIZE: 50,
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'X-API-KEY': '78b1cb7a725e42d1bd753b0b9e2c0757'
  }
} as const;