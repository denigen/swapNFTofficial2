import { NFTToken } from '../../../types/nft';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { findNFTContracts } from '../discovery';
import { getTokensForContract } from './tokenFetcher';
import { getNetworkConfig } from '../../../config/networks';

export async function fetchOnChainNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  try {
    const provider = await getProvider(chainId);
    const config = getNetworkConfig(chainId);
    
    if (!config) {
      console.warn(`No configuration found for chain ${chainId}`);
      return [];
    }

    console.log(`Starting on-chain NFT fetch for ${ownerAddress}`);
    
    // Find NFT contracts
    const contracts = await findNFTContracts(provider, ownerAddress);
    console.log(`Found ${contracts.length} potential NFT contracts`);

    const tokens: NFTToken[] = [];
    const batchSize = config.batchSize || 5;

    // Process contracts in batches
    for (let i = 0; i < contracts.length; i += batchSize) {
      const batch = contracts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(contractAddress =>
        getTokensForContract(contractAddress, ownerAddress, chainId)
          .catch(error => {
            console.warn(`Error processing contract ${contractAddress}:`, error);
            return [];
          })
      );

      const results = await Promise.allSettled(batchPromises);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          console.log(`Found ${result.value.length} tokens in contract ${batch[index]}`);
          tokens.push(...result.value);
        }
      });

      // Add delay between batches
      if (i + batchSize < contracts.length) {
        await new Promise(resolve => setTimeout(resolve, config.requestDelay || 200));
      }
    }

    console.log(`Found ${tokens.length} total tokens on-chain`);
    return tokens;
  } catch (error) {
    console.error('Error in on-chain NFT fetch:', error);
    return [];
  }
}