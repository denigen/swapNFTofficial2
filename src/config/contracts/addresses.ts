import { CHAIN_IDS } from '../chains/constants';

export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.BASE]: {
    NFT_SWAP: '0x553020d1902bDe2F71ae9eeA828F41492127D716'
  },
  [CHAIN_IDS.APECHAIN]: {
    NFT_SWAP: '0xf3e6646f932376fd8fb2b7a40fa826543747bb80'
  }
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES[typeof CHAIN_IDS.BASE];

export function getContractAddress(chainId: number, contractName: ContractName): string {
  const chainContracts = CONTRACT_ADDRESSES[chainId];
  if (!chainContracts) {
    throw new Error(`No contracts found for chain ID ${chainId}`);
  }
  return chainContracts[contractName];
}