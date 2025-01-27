import { Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { ERC721_ABI, ERC1155_ABI } from '../../../config/contracts/abis';
import { getContractMetadata } from '../metadata';

export async function getTokensForContract(
  contractAddress: string,
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const provider = await getProvider(chainId);
  const tokens: NFTToken[] = [];

  try {
    // Try ERC721 first
    const erc721Contract = new Contract(contractAddress, ERC721_ABI, provider);
    const balance = await erc721Contract.balanceOf(ownerAddress);
    
    if (balance > 0) {
      const metadata = await getContractMetadata(contractAddress, chainId);
      
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await erc721Contract.tokenOfOwnerByIndex(ownerAddress, i);
          const owner = await erc721Contract.ownerOf(tokenId);
          
          if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
            tokens.push({
              id: `${contractAddress}-${tokenId}`,
              name: `${metadata.name} #${tokenId}`,
              collection: metadata.name,
              imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
              contractAddress,
              tokenId: tokenId.toString(),
              chainId,
              standard: 'ERC721'
            });
          }
        } catch (error) {
          console.warn(`Error processing ERC721 token ${i}:`, error);
        }
      }
    }
  } catch {
    // Try ERC1155
    try {
      const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
      const metadata = await getContractMetadata(contractAddress, chainId);
      
      // Check first 100 token IDs
      for (let tokenId = 0; tokenId < 100; tokenId++) {
        try {
          const balance = await erc1155Contract.balanceOf(ownerAddress, tokenId);
          if (balance > 0) {
            tokens.push({
              id: `${contractAddress}-${tokenId}`,
              name: `${metadata.name} #${tokenId}`,
              collection: metadata.name,
              imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
              contractAddress,
              tokenId: tokenId.toString(),
              chainId,
              standard: 'ERC1155',
              balance: Number(balance)
            });
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.warn(`Contract ${contractAddress} is not ERC721 or ERC1155`);
    }
  }

  return tokens;
}