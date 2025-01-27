export const APECHAIN_API_CONFIG = {
  API_KEY: 'MIGTNEEB9PVDC12ED7QYN46TPETRZWJQMQ',
  BASE_URL: 'wss://apechain.drpc.org',
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 50
} as const;

export const APECHAIN_ENDPOINTS = {
  ACCOUNT: '/account',
  NFT: '/nft',
  TRANSACTION: '/tx',
  CONTRACT: '/contract'
} as const;