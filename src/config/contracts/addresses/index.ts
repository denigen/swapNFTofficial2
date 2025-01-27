import { CHAIN_IDS } from '../constants';

export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.BASE]: {
    NFT_SWAP: '0xe1053fb2d21e7dff3b024ddd9898032864cf4697'
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