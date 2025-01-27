import { Contract } from 'ethers';
import { NFTToken } from '../../types/nft';
import { getProvider } from '../../utils/providers/rpcProvider';
import { ERC721_ABI, ERC1155_ABI } from '../../config/contracts/abis';
import { getNFTMetadata } from './metadata';

export async function getTokensForContract(
  contractAddress: string,
  walletAddress: string,
  chainId: number,
  balance: number
): Promise<NFTToken[]> {
  const provider = await getProvider(chainId);
  const tokens: NFTToken[] = [];

  try {
    // Try ERC721
    const erc721Contract = new Contract(contractAddress, ERC721_ABI, provider);
    const { name } = await getNFTMetadata(contractAddress, chainId);

    for (let i = 0; i < balance; i++) {
      try {
        // Use try-catch for each token operation
        let tokenId;
        try {
          tokenId = await erc721Contract.tokenOfOwnerByIndex(walletAddress, i);
        } catch (error) {
          console.warn(`Error getting token index ${i}:`, error);
          continue;
        }

        let owner;
        try {
          owner = await erc721Contract.ownerOf(tokenId);
        } catch (error) {
          console.warn(`Error getting owner for token ${tokenId}:`, error);
          continue;
        }

        // Verify ownership
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
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
        console.warn(`Error processing token ${i} from ${contractAddress}:`, err);
        continue;
      }
    }
  } catch (error) {
    // Try ERC1155
    try {
      const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
      const { name } = await getNFTMetadata(contractAddress, chainId);

      // Check first 100 token IDs
      for (let tokenId = 0; tokenId < 100; tokenId++) {
        try {
          const balance = await erc1155Contract.balanceOf(walletAddress, tokenId);
          if (balance > 0) {
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
    } catch (error) {
      console.warn(`Contract ${contractAddress} is not ERC721 or ERC1155:`, error);
    }
  }

  return tokens;
}