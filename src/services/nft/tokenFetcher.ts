import { Contract, JsonRpcProvider } from 'ethers';
import { NFTToken } from '../../types/nft';
import { ERC721_ABI, ERC1155_ABI } from '../../config/contracts/abis';

export async function fetchTokensForContract(
  contractAddress: string,
  ownerAddress: string,
  chainId: number,
  provider: JsonRpcProvider
): Promise<NFTToken[]> {
  const tokens: NFTToken[] = [];

  try {
    // Try as ERC721 first
    const erc721Contract = new Contract(contractAddress, ERC721_ABI, provider);
    
    try {
      const balance = await erc721Contract.balanceOf(ownerAddress);
      console.log(`ERC721 balance for ${contractAddress}: ${balance}`);
      
      if (balance > 0) {
        const name = await erc721Contract.name().catch(() => 'Unknown Collection');
        
        // Use tokenOfOwnerByIndex to get all tokens
        for (let i = 0; i < Number(balance); i++) {
          try {
            const tokenId = await erc721Contract.tokenOfOwnerByIndex(ownerAddress, i);
            const owner = await erc721Contract.ownerOf(tokenId);
            
            // Verify ownership
            if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
              console.log(`Found token ID: ${tokenId} owned by ${ownerAddress}`);
              
              tokens.push({
                id: `${contractAddress}-${tokenId}`,
                name: `${name} #${tokenId}`,
                collection: name,
                imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
                contractAddress,
                tokenId: tokenId.toString(),
                chainId,
                standard: 'ERC721'
              });
            }
          } catch (err) {
            console.warn(`Error fetching token ${i} from ${contractAddress}:`, err);
          }
        }
      }
    } catch (err) {
      // Not an ERC721, try ERC1155
      console.log('Not an ERC721 contract, trying ERC1155...');
      
      const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
      const name = await erc1155Contract.name().catch(() => 'Unknown Collection');
      
      // Check first 10 token IDs for ERC1155
      for (let tokenId = 0; tokenId < 10; tokenId++) {
        try {
          const balance = await erc1155Contract.balanceOf(ownerAddress, tokenId);
          if (balance > 0) {
            console.log(`Found ERC1155 token ID: ${tokenId} with balance: ${balance}`);
            
            tokens.push({
              id: `${contractAddress}-${tokenId}`,
              name: `${name} #${tokenId}`,
              collection: name,
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
    }
  } catch (error) {
    console.error(`Error processing contract ${contractAddress}:`, error);
  }

  return tokens;
}