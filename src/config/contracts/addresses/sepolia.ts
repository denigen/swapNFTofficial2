import { CHAIN_IDS } from './common';

// Sepolia testnet contract addresses
export const SEPOLIA_CONTRACTS = {
  SWAP: '0x553020d1902bDe2F71ae9eeA828F41492127D716',
  TEST_NFT: '0x155E718645D961c299F5F1BA5BB5fadb241C8D65',
  MOCK_NFT: '0xC84f1Ce11673A57ce8287564201badb7E1De6f99'
} as const;

// Known NFT contracts on Sepolia - IMPORTANT: These must be the actual deployed NFT contracts
export const SEPOLIA_NFT_CONTRACTS = [
  SEPOLIA_CONTRACTS.MOCK_NFT, // Add the NFT contract you want to test with
] as const;

// Export for direct access
export const SEPOLIA_CONFIG = {
  chainId: CHAIN_IDS.SEPOLIA,
  contracts: SEPOLIA_CONTRACTS,
  nftContracts: SEPOLIA_NFT_CONTRACTS
} as const;