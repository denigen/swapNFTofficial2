import { JsonRpcProvider } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { findNFTContracts } from '../contractDiscovery';
import { getTokensForContract } from '../tokenOperations';
import { getNetworkConfig } from '../../../config/networks';

export async function fetchOnChainNFTs(
  provider: JsonRpcProvider,
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  try {
    const config = getNetworkConfig(chainId);
    if (!config) {
      console.warn(`No configuration found for chain ${chainId}`);
      return [];
    }

    console.log(`Starting on-chain NFT fetch for ${address} on chain ${chainId}`);
    
    // Find NFT contracts
    const contracts = await findNFTContracts(provider, address);
    if (!contracts.length) {
      console.log('No NFT contracts found for address:', address);
      return [];
    }

    console.log(`Found ${contracts.length} potential NFT contracts`);
    
    // Process contracts in batches
    const tokens: NFTToken[] = [];
    const batchSize = config.batchSize || 5;

    for (let i = 0; i < contracts.length; i += batchSize) {
      const batch = contracts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(contractAddress => 
        getTokensForContract(contractAddress, address, chainId)
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

    console.log(`Found ${tokens.length} total tokens on-chain for ${address}`);
    return tokens;
  } catch (error) {
    console.error('Error in on-chain NFT fetch:', error);
    return [];
  }
}