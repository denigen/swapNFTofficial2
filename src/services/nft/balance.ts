import { Contract } from 'ethers';
import { getProvider } from '../../utils/providers/rpcProvider';
import { ERC721_ABI, ERC1155_ABI } from '../../config/contracts/abis';

export async function getNFTBalance(
  contractAddress: string,
  walletAddress: string,
  chainId: number
): Promise<number> {
  try {
    const provider = await getProvider(chainId);
    
    // Try ERC721 first
    try {
      const erc721Contract = new Contract(contractAddress, ERC721_ABI, provider);
      const balance = await erc721Contract.balanceOf(walletAddress);
      return Number(balance);
    } catch {
      // If ERC721 fails, try ERC1155
      const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
      let totalBalance = 0;
      
      // Check first few token IDs
      for (let id = 0; id < 10; id++) {
        try {
          const balance = await erc1155Contract.balanceOf(walletAddress, id);
          totalBalance += Number(balance);
        } catch {
          break;
        }
      }
      
      return totalBalance;
    }
  } catch (error) {
    console.error(`Error getting balance for contract ${contractAddress}:`, error);
    return 0;
  }
}