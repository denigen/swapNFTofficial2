export const API_CONFIG = {
  RESERVOIR: {
    API_KEY: '3e94d8c0-8e74-5cbc-988e-15565710d9aa',
    BASE_URL: 'https://api.reservoir.tools',
    APECHAIN_URL: 'https://api-apechain.reservoir.tools',
    BNB_URL: 'https://api-bsc.reservoir.tools'
  },
  OPENSEA: {
    API_KEY: '78b1cb7a725e42d1bd753b0b9e2c0757',
    BASE_URL: 'https://api.opensea.io/api/v2',
    TESTNET_URL: 'https://testnets-api.opensea.io/api/v2'
  }
} as const;

export const SUPPORTED_CHAINS = {
  SEPOLIA: 11155111,
  ETHEREUM: 1,
  BASE: 8453,
  APECHAIN: 33139,
  BNB: 56
} as const;