import { Contract } from 'ethers';
import { getProvider } from '../../utils/providers/rpcProvider';
import { ERC721_ABI } from '../../config/contracts/abis';

interface ContractMetadata {
  name: string;
  symbol: string;
}

export async function getContractMetadata(
  contractAddress: string,
  chainId: number
): Promise<ContractMetadata> {
  try {
    const provider = await getProvider(chainId);
    const contract = new Contract(contractAddress, ERC721_ABI, provider);
    
    const [name, symbol] = await Promise.all([
      contract.name().catch(() => 'Unknown Collection'),
      contract.symbol().catch(() => 'NFT')
    ]);

    return { name, symbol };
  } catch (error) {
    console.error(`Error getting metadata for contract ${contractAddress}:`, error);
    return { name: 'Unknown Collection', symbol: 'NFT' };
  }
}