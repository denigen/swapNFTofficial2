import { JsonRpcProvider } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { fetchERC721Tokens } from './erc721Fetcher';
import { fetchERC1155Tokens } from './erc1155Fetcher';
import { getBaseContracts } from './contractDiscovery';
import { retryWithBackoff } from '../../../utils/retry';
import { BASE_SCAN_CONFIG } from './constants';

export async function fetchBaseChainNFTs(
  provider: JsonRpcProvider,
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  if (chainId !== 8453) return [];

  try {
    console.log('Starting BASE chain NFT fetch...');
    const tokens: NFTToken[] = [];

    // Get all relevant contracts with retry
    const contracts = await retryWithBackoff(
      () => getBaseContracts(provider, address),
      BASE_SCAN_CONFIG.MAX_RETRIES,
      BASE_SCAN_CONFIG.INITIAL_DELAY
    );

    console.log(`Found ${contracts.length} potential NFT contracts on BASE`);

    // Process contracts in batches
    for (let i = 0; i < contracts.length; i += BASE_SCAN_CONFIG.BATCH_SIZE) {
      const batch = contracts.slice(i, i + BASE_SCAN_CONFIG.BATCH_SIZE);
      
      const batchPromises = batch.map(async (contractAddress) => {
        try {
          // Try ERC721 first with retry
          const erc721Tokens = await retryWithBackoff(
            () => fetchERC721Tokens(provider, contractAddress, address),
            2,
            500
          );
          
          if (erc721Tokens.length > 0) {
            console.log(`Found ${erc721Tokens.length} ERC721 tokens in ${contractAddress}`);
            return erc721Tokens;
          }

          // If no ERC721 tokens, try ERC1155 with retry
          const erc1155Tokens = await retryWithBackoff(
            () => fetchERC1155Tokens(provider, contractAddress, address),
            2,
            500
          );
          
          if (erc1155Tokens.length > 0) {
            console.log(`Found ${erc1155Tokens.length} ERC1155 tokens in ${contractAddress}`);
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
      if (i + BASE_SCAN_CONFIG.BATCH_SIZE < contracts.length) {
        await new Promise(resolve => setTimeout(resolve, BASE_SCAN_CONFIG.REQUEST_DELAY));
      }
    }

    console.log(`Found ${tokens.length} total NFTs on BASE chain`);
    return tokens;
  } catch (error) {
    console.error('Error in BASE chain NFT fetch:', error);
    return [];
  }
}