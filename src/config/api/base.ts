export const BASE_API_CONFIG = {
  API_KEY: '9SQ5ZE42TVYAAJQ64T3PRKN83PVTK3HGXW', // BASE API Key
  BASE_URL: 'https://api.basescan.org/api',
  VERSION: 'v1',
  ENDPOINTS: {
    ACCOUNT: 'account',
    CONTRACT: 'contract',
    TRANSACTION: 'transaction',
    EVENT: 'event',
    TOKEN: 'token'
  },
  RATE_LIMITS: {
    REQUESTS_PER_SECOND: 5,
    MAX_REQUESTS_PER_DAY: 100000
  }
} as const;