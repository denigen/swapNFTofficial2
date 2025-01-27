export * from './opensea';
export * from './chains';

export const API_CONFIG = {
  OPENSEA: {
    BASE_URL: 'https://api.opensea.io/api/v2',
    TESTNET_URL: 'https://testnets-api.opensea.io/api/v2'
  }
} as const;