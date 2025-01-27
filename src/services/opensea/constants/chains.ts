export const OPENSEA_CHAINS = {
  ETHEREUM: 1,
  BASE: 8453
} as const;

export const CHAIN_NAMES: Record<number, string> = {
  [OPENSEA_CHAINS.ETHEREUM]: 'ethereum',
  [OPENSEA_CHAINS.BASE]: 'base'
} as const;

export const SUPPORTED_CHAINS = new Set(Object.values(OPENSEA_CHAINS));