import { JsonRpcProvider, Contract } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { ERC721_ABI, ERC1155_ABI } from '../../../config/contracts/abis';
import { KNOWN_NFT_CONTRACTS } from '../../../config/contracts/addresses';
import { retryWithBackoff } from '../../../utils/retry';

const BATCH_SIZE = 3;
const REQUEST_DELAY = 300;

export async function fetchBaseChainNFTs(
  provider: JsonRpcProvider,
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  if (chainId !== 8453) return [];

  try {
    console.log('Starting BASE chain NFT fetch...');
    const tokens: NFTToken[] = [];
    const knownContracts = KNOWN_NFT_CONTRACTS[chainId] || [];

    // Process contracts in batches
    for (let i = 0; i < knownContracts.length; i += BATCH_SIZE) {
      const batch = knownContracts.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (contractAddress) => {
        try {
          // Try ERC721 first
          const contract = new Contract(contractAddress, ERC721_ABI, provider);
          const balance = await contract.balanceOf(address);
          
          if (balance > 0) {
            const name = await contract.name().catch(() => 'Unknown Collection');
            const tokens: NFTToken[] = [];
            
            for (let j = 0; j < balance; j++) {
              try {
                const tokenId = await contract.tokenOfOwnerByIndex(address, j);
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
              } catch (error) {
                console.warn(`Error fetching token ${j} from ${contractAddress}:`, error);
              }
            }
            return tokens;
          }

          // Try ERC1155 if no ERC721 tokens found
          const erc1155Contract = new Contract(contractAddress, ERC1155_ABI, provider);
          const erc1155Tokens: NFTToken[] = [];
          
          for (let tokenId = 0; tokenId < 100; tokenId++) {
            try {
              const balance = await erc1155Contract.balanceOf(address, tokenId);
              if (balance > 0) {
                const name = await erc1155Contract.name().catch(() => 'Unknown Collection');
                erc1155Tokens.push({
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
          return erc1155Tokens;
        } catch (error) {
          console.warn(`Error processing contract ${contractAddress}:`, error);
          return [];
        }
      });

      const results = await Promise.allSettled(batchPromises);
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          tokens.push(...result.value);
        }
      });

      // Add delay between batches
      if (i + BATCH_SIZE < knownContracts.length) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      }
    }

    console.log(`Found ${tokens.length} NFTs on BASE chain`);
    return tokens;
  } catch (error) {
    console.error('Error in BASE chain NFT fetch:', error);
    return [];
  }
}