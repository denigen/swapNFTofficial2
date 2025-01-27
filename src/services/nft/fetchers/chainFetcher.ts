import { JsonRpcProvider } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { getNetworkConfig } from '../../../config/networks';
import { fetchOpenSeaNFTs } from './openSeaFetcher';
import { fetchOnChainNFTs } from './onChainFetcher';
import { fetchBaseChainNFTs } from './baseChainFetcher';

export async function fetchChainNFTs(
  provider: JsonRpcProvider,
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  const config = getNetworkConfig(chainId);
  if (!config) {
    console.warn(`No configuration found for chain ID ${chainId}`);
    return [];
  }

  try {
    console.log(`Fetching NFTs for ${address} on ${config.name}...`);
    const allNFTs: NFTToken[] = [];

    // Fetch from all sources in parallel
    const fetchPromises = [
      // Always try on-chain fetching
      fetchOnChainNFTs(provider, address, chainId).catch(error => {
        console.warn('On-chain fetch failed:', error);
        return [];
      })
    ];

    // Add OpenSea fetching if not ApeChain
    if (chainId !== 33139) {
      fetchPromises.push(
        fetchOpenSeaNFTs(address, chainId).catch(error => {
          console.warn('OpenSea fetch failed:', error);
          return [];
        })
      );
    }

    // Add BASE-specific fetching if on BASE network
    if (chainId === 8453) {
      fetchPromises.push(
        fetchBaseChainNFTs(provider, address, chainId).catch(error => {
          console.warn('BASE-specific fetch failed:', error);
          return [];
        })
      );
    }

    // Wait for all fetches to complete
    const results = await Promise.all(fetchPromises);

    // Combine results
    results.forEach((nfts, index) => {
      if (nfts.length > 0) {
        console.log(`Found ${nfts.length} NFTs from source ${index}`);
        allNFTs.push(...nfts);
      }
    });

    // Deduplicate NFTs
    const uniqueNFTs = deduplicateNFTs(allNFTs);
    console.log(`Total unique NFTs found: ${uniqueNFTs.length}`);
    
    return uniqueNFTs;
  } catch (error) {
    console.error(`Error fetching NFTs on ${config.name}:`, error);
    return [];
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