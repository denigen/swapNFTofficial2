import { Contract } from 'ethers';
import { getProvider } from '../../utils/providers';
import { ERC721_ABI, ERC1155_ABI } from '../../config/contracts/abis';

interface OwnershipVerification {
  isOwner: boolean;
  error?: string;
}

export async function verifyNFTOwnership(
  contractAddress: string,
  tokenId: string,
  ownerAddress: string,
  chainId: number
): Promise<OwnershipVerification> {
  try {
    const provider = await getProvider(chainId);
    
    // Try ERC721 first
    try {
      const erc721Contract = new Contract(contractAddress, ERC721_ABI, provider);
      const owner = await erc721Contract.ownerOf(tokenId);
      
      return {
        isOwner: owner.toLowerCase() === ownerAddress.toLowerCase()
      };
    } catch (erc721Error) {
      // If not ERC721, try ERC1155
      try {
        const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
        const balance = await erc1155Contract.balanceOf(ownerAddress, tokenId);
        
        return {
          isOwner: Number(balance) > 0
        };
      } catch (erc1155Error) {
        return {
          isOwner: false,
          error: 'Contract does not implement ERC721 or ERC1155 interface'
        };
      }
    }
  } catch (error) {
    return {
      isOwner: false,
      error: error instanceof Error ? error.message : 'Unknown error during ownership verification'
    };
  }
}