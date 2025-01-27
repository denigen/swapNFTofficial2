export const MAGICEDEN_CONFIG = {
  API_KEY: '25c6ecdb-282a-4e18-a63f-624070cb088d',
  BASE_URL: 'https://api-mainnet.magiceden.dev/v2/wallets/{walletAddress}/tokens',
  SUPPORTED_CHAINS: {
    APECHAIN: 33139,
    BNB: 56
  } as const,
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  DEFAULT_HEADERS: {
    'accept': '*/*',
    'x-api-key': '25c6ecdb-282a-4e18-a63f-624070cb088d'
  },
  COLLECTION_PARAMS: {
    includeMintStages: false,
    includeSecurityConfigs: false,
    normalizeRoyalties: false,
    useNonFlaggedFloorAsk: false,
    sortBy: 'allTimeVolume',
    limit: 20
  }
} as const;