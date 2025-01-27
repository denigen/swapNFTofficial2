import { NFTToken } from '../../../types/nft';
import { fetchOpenSeaNFTs } from '../../opensea/fetcher';
import { fetchMagicEdenNFTs } from '../../magiceden/fetcher';
import { retryWithBackoff } from '../../../utils/retry';

export async function fetchAllNFTs(
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  if (!address || !chainId) {
    console.log('Missing address or chainId');
    return [];
  }

  try {
    console.log(`Fetching NFTs for ${address} on chain ${chainId}`);

    // For Base chain, use OpenSea exclusively
    if (chainId === 8453) {
      console.log('Using OpenSea API for Base chain');
      return await retryWithBackoff(
        () => fetchOpenSeaNFTs(address, chainId),
        3,
        1000,
        { maxDelay: 5000 }
      );
    }

    // For ApeChain and BNB Chain, use MagicEden
    if (chainId === 33139 || chainId === 56) {
      console.log('Using MagicEden API for chain:', chainId);
      return await retryWithBackoff(
        () => fetchMagicEdenNFTs(address, chainId),
        3,
        1000,
        { maxDelay: 5000 }
      );
    }

    // For other chains, return empty array
    console.log(`Chain ${chainId} not supported`);
    return [];
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}