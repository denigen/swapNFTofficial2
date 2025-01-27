import { CHAIN_IDS } from '../../chains/constants';

export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.BASE]: {
    NFT_SWAP: '0xe1053fb2d21e7dff3b024ddd9898032864cf4697'
  },
  [CHAIN_IDS.APECHAIN]: {
    NFT_SWAP: '0xd066ca8f3e18b33c575b4b72ae3da48c329bb73a'
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