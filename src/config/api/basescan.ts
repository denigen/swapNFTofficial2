export const BASESCAN_CONFIG = {
  API_KEY: '9SQ5ZE42TVYAAJQ64T3PRKN83PVTK3HGXW',
  BASE_URL: 'https://api.basescan.org/api',
  RATE_LIMIT: {
    CALLS_PER_SECOND: 5,
    MAX_REQUESTS_PER_DAY: 100000
  },
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;

export const BASESCAN_ENDPOINTS = {
  ACCOUNT: 'account',
  CONTRACT: 'contract',
  TRANSACTION: 'transaction',
  TOKEN: 'token',
  STATS: 'stats'
} as const;