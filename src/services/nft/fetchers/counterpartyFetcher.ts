import { NFTToken } from '../../../types/nft';
import { fetchOpenSeaNFTs } from './openSeaFetcher';
import { fetchOnChainNFTs } from './onChainFetcher';
import { fetchBaseChainNFTs } from './baseChainFetcher';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { retryWithBackoff } from '../../../utils/retry';

export async function fetchCounterpartyNFTs(
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  try {
    console.log(`Fetching counterparty NFTs for ${address} on chain ${chainId}`);
    const provider = await getProvider(chainId);
    const allNFTs: NFTToken[] = [];

    // Fetch from all sources in parallel with retries
    const fetchPromises = [
      // OpenSea fetch with retry
      retryWithBackoff(
        () => fetchOpenSeaNFTs(address, chainId),
        3,
        1000,
        { maxDelay: 5000 }
      ).catch(error => {
        console.warn('OpenSea fetch failed:', error);
        return [];
      }),

      // On-chain fetch with retry
      retryWithBackoff(
        () => fetchOnChainNFTs(provider, address, chainId),
        3,
        1000,
        { maxDelay: 5000 }
      ).catch(error => {
        console.warn('On-chain fetch failed:', error);
        return [];
      })
    ];

    // Add BASE-specific fetching if on BASE network
    if (chainId === 8453) {
      fetchPromises.push(
        retryWithBackoff(
          () => fetchBaseChainNFTs(provider, address, chainId),
          3,
          1000,
          { maxDelay: 5000 }
        ).catch(error => {
          console.warn('BASE-specific fetch failed:', error);
          return [];
        })
      );
    }

    const results = await Promise.allSettled(fetchPromises);
    
    // Add NFTs from successful fetches
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`Found ${result.value.length} NFTs from source ${index}`);
        allNFTs.push(...result.value);
      }
    });

    // Deduplicate NFTs
    const uniqueNFTs = deduplicateNFTs(allNFTs);
    console.log(`Total unique NFTs found for counterparty: ${uniqueNFTs.length}`);

    return uniqueNFTs;
  } catch (error) {
    console.error('Error fetching counterparty NFTs:', error);
    throw error;
  }
}

function deduplicateNFTs(nfts: NFTToken[]): NFTToken[] {
  const seen = new Set<string>();
  return nfts.filter(nft => {
    const key = `${nft.contractAddress.toLowerCase()}-${nft.tokenId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}