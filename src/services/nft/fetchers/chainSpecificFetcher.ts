import { JsonRpcProvider } from 'ethers';
import { NFTToken } from '../../../types/nft';
import { NetworkConfig } from '../../../config/networks/types';
import { fetchBaseChainNFTs } from './baseChainFetcher';
import { fetchFromOpenSea } from './openSeaFetcher';

export async function fetchChainSpecificNFTs(
  provider: JsonRpcProvider,
  address: string,
  config: NetworkConfig
): Promise<NFTToken[]> {
  const tokens: NFTToken[] = [];

  try {
    // Fetch from chain-specific implementation if available
    if (config.chainId === 8453) { // Base Chain
      const baseNFTs = await fetchBaseChainNFTs(provider, address);
      tokens.push(...baseNFTs);
    }

    // Try OpenSea API for supported networks
    try {
      const openSeaNFTs = await fetchFromOpenSea(address, config.chainId);
      tokens.push(...openSeaNFTs);
    } catch (error) {
      console.warn(`OpenSea fetch failed for ${config.name}:`, error);
    }

    return deduplicateNFTs(tokens);
  } catch (error) {
    console.error(`Error fetching NFTs for ${config.name}:`, error);
    return tokens;
  }
}

function deduplicateNFTs(nfts: NFTToken[]): NFTToken[] {
  const seen = new Set<string>();
  return nfts.filter(nft => {
    const key = `${nft.contractAddress}-${nft.tokenId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}