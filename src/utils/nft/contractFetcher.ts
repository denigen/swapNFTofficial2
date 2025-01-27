import { Contract } from 'ethers';
import { NFTToken } from '../../types/nft';
import { getProvider } from '../providers/rpcProvider';
import { ERC721_ABI, ERC1155_ABI } from '../../config/contracts/abis';

export async function fetchTokensForContract(
  contractAddress: string,
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  try {
    const provider = await getProvider(chainId);
    const tokens: NFTToken[] = [];

    // Try ERC721
    const erc721Contract = new Contract(contractAddress, ERC721_ABI, provider);
    try {
      const balance = await erc721Contract.balanceOf(ownerAddress);
      
      if (balance > 0) {
        const name = await erc721Contract.name().catch(() => 'Unknown Collection');
        
        for (let i = 0; i < balance; i++) {
          try {
            const tokenId = await erc721Contract.tokenOfOwnerByIndex(ownerAddress, i);
            
            tokens.push({
              id: `${contractAddress}-${tokenId}`,
              name: `${name} #${tokenId}`,
              collection: name,
              imageUrl: 'https://via.placeholder.com/150', // Fallback image
              contractAddress,
              tokenId: tokenId.toString(),
              chainId,
              standard: 'ERC721'
            });
          } catch (error) {
            console.warn(`Error fetching token ${i} from ${contractAddress}:`, error);
          }
        }
      }
    } catch (error) {
      // Not an ERC721 contract, try ERC1155
      console.debug('Not an ERC721 contract, trying ERC1155');
    }

    // Try ERC1155
    if (tokens.length === 0) {
      const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
      try {
        const name = await erc1155Contract.name().catch(() => 'Unknown Collection');
        
        // Check first 100 token IDs
        for (let tokenId = 0; tokenId < 100; tokenId++) {
          try {
            const balance = await erc1155Contract.balanceOf(ownerAddress, tokenId);
            if (balance > 0) {
              tokens.push({
                id: `${contractAddress}-${tokenId}`,
                name: `${name} #${tokenId}`,
                collection: name,
                imageUrl: 'https://via.placeholder.com/150', // Fallback image
                contractAddress,
                tokenId: tokenId.toString(),
                chainId,
                standard: 'ERC1155',
                balance: Number(balance)
              });
            }
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        console.debug('Not an ERC1155 contract either');
      }
    }

    return tokens;
  } catch (error) {
    console.error('Error fetching tokens for contract:', error);
    return [];
  }
}