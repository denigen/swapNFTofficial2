import { JsonRpcProvider } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { getTokensForContract } from '../tokens';
import { getNFTBalance } from '../balance';
import { getKnownContracts } from '../contracts';
import { BASE_CONFIG } from '../../../config/networks/base';

export async function fetchBaseNFTs(
  provider: JsonRpcProvider,
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  if (chainId !== BASE_CONFIG.chainId) {
    return [];
  }

  try {
    console.log('Fetching NFTs from Base...');
    const tokens: NFTToken[] = [];
    const contracts = getKnownContracts(chainId);
    
    // Process contracts in batches
    for (let i = 0; i < contracts.length; i += BASE_CONFIG.batchSize) {
      const batch = contracts.slice(i, i + BASE_CONFIG.batchSize);
      
      const batchPromises = batch.map(async (contractAddress) => {
        try {
          const balance = await getNFTBalance(contractAddress, address, chainId);
          
          if (balance > 0) {
            return getTokensForContract(contractAddress, address, chainId, balance);
          }
          return [];
        } catch (error) {
          console.warn(`Error processing Base contract ${contractAddress}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          tokens.push(...result.value);
        }
      });

      // Add delay between batches
      if (i + BASE_CONFIG.batchSize < contracts.length) {
        await new Promise(resolve => setTimeout(resolve, BASE_CONFIG.requestDelay));
      }
    }

    console.log(`Found ${tokens.length} NFTs on Base`);
    return tokens;
  } catch (error) {
    console.error('Error fetching Base NFTs:', error);
    throw new Error('Failed to fetch Base NFTs');
  }
}