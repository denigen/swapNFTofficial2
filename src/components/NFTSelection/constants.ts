export const NFT_SELECTION_TABS = {
  OWNED: 'owned',
  COUNTERPARTY: 'counterparty'
} as const;

export const EMPTY_STATE_MESSAGES = {
  OWNED: 'No NFTs found in your wallet',
  COUNTERPARTY: 'No NFTs found in counterparty wallet'
} as const;

export const ERROR_MESSAGES = {
  LOADING_FAILED: 'Failed to load NFTs',
  INVALID_ADDRESS: 'Invalid wallet address',
  NETWORK_ERROR: 'Network error occurred'
} as const;