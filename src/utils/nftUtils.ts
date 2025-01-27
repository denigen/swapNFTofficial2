import { NFTToken } from '../types/nft';
import { getProvider } from './providers/rpcProvider';
import { findNFTContracts } from './nft/contractFinder';
import { fetchTokensForContract } from './nft/tokenFetcher';

const CHAIN_START_BLOCKS: Record<number, number> = {
  11155111: 2800000, // Sepolia (adjusted to more recent block)
  1: 12000000,      // Ethereum (from 2021)
  8453: 1,          // Base
  56: 5000000       // BSC
};

export async function fetchNFTsForAddress(
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  if (!address) return [];

  try {
    console.log(`Fetching NFTs for ${address} on chain ${chainId}`);
    const provider = await getProvider(chainId);
    const startBlock = CHAIN_START_BLOCKS[chainId] || 0;
    
    // Find all potential NFT contracts
    console.log('Finding NFT contracts...');
    const contracts = await findNFTContracts(provider, address, startBlock);
    console.log(`Found ${contracts.length} potential NFT contracts`);
    
    // Fetch tokens from each contract in parallel with batching
    const batchSize = 5; // Process 5 contracts at a time
    const tokens: NFTToken[] = [];
    
    for (let i = 0; i < contracts.length; i += batchSize) {
      const batch = contracts.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(contract => fetchTokensForContract(contract, address, chainId))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          tokens.push(...result.value);
          console.log(`Found ${result.value.length} tokens in contract ${batch[index]}`);
        }
      });
    }

    console.log(`Total tokens found: ${tokens.length}`);
    return tokens;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}