import { Contract } from 'ethers';
import { getNFTContractsForChain } from '../../../config/contracts/nft/addresses';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { ERC721_ABI, ERC1155_ABI } from '../../../config/contracts/abis';

export async function getContractsForChain(chainId: number): Promise<Contract[]> {
  const provider = await getProvider(chainId);
  const addresses = getNFTContractsForChain(chainId);
  
  return addresses.map(address => {
    try {
      return new Contract(address, ERC721_ABI, provider);
    } catch {
      return new Contract(address, ERC1155_ABI, provider);
    }
  });
}

export * from './validation';
export * from './metadata';