import { SEPOLIA_NFT_CONTRACTS } from '../addresses/sepolia';
import { BASE_NFT_CONTRACTS } from '../addresses/base';
import { CHAIN_IDS } from '../addresses/common';

// Centralized NFT contract addresses configuration
export const NFT_CONTRACT_ADDRESSES = {
  [CHAIN_IDS.SEPOLIA]: SEPOLIA_NFT_CONTRACTS,
  [CHAIN_IDS.BASE]: BASE_NFT_CONTRACTS
} as const;

// Helper function to get NFT contracts for a chain
export function getNFTContractsForChain(chainId: number): readonly string[] {
  return NFT_CONTRACT_ADDRESSES[chainId as keyof typeof NFT_CONTRACT_ADDRESSES] || [];
}