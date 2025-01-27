import { JsonRpcProvider } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { findNFTContracts } from '../contractFinder';
import { fetchTokensForContract } from '../tokenFetcher';

const BATCH_SIZE = 3; // Smaller batch size for BNB Chain
const REQUEST_DELAY = 500; // Longer delay between requests

export async function fetchBNBChainNFTs(
  provider: JsonRpcProvider,
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  try {
    console.log('Fetching NFTs from BNB Chain...');
    
    // Find NFT contracts
    const contracts = await findNFTContracts(provider, address);
    console.log(`Found ${contracts.length} potential NFT contracts on BNB Chain`);

    const tokens: NFTToken[] = [];
    
    // Process contracts in smaller batches with longer delays
    for (let i = 0; i < contracts.length; i += BATCH_SIZE) {
      const batch = contracts.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.allSettled(
        batch.map(contractAddress => 
          fetchTokensForContract(contractAddress, address, chainId)
        )
      );
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          tokens.push(...result.value);
        }
      });

      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < contracts.length) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      }
    }

    console.log(`Found ${tokens.length} total NFTs on BNB Chain`);
    return tokens;
  } catch (error) {
    console.error('Error fetching BNB Chain NFTs:', error);
    return [];
  }
}