import { NFTToken } from '../../types/nft';
import { getProvider } from '../../utils/providers/rpcProvider';
import { fetchOnChainNFTs } from './fetchers/onChainFetcher';
import { fetchOpenSeaNFTs } from '../opensea/fetcher';
import { fetchAlchemyNFTs } from './providers/alchemyProvider';

export async function fetchWalletNFTs(
  walletAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  if (!walletAddress || !chainId) {
    console.log('Missing wallet address or chain ID');
    return [];
  }

  try {
    console.log(`Fetching NFTs for ${walletAddress} on chain ${chainId}`);

    // For ApeChain, use Alchemy
    if (chainId === 33139) {
      try {
        const alchemyNFTs = await fetchAlchemyNFTs(walletAddress, chainId);
        if (alchemyNFTs.length > 0) {
          return alchemyNFTs;
        }
      } catch (error) {
        console.warn('Alchemy fetch failed, falling back to on-chain:', error);
        const provider = await getProvider(chainId);
        return await fetchOnChainNFTs(provider, walletAddress, chainId);
      }
    }

    // For other chains, try OpenSea first
    try {
      const openSeaNFTs = await fetchOpenSeaNFTs(walletAddress, chainId);
      if (openSeaNFTs.length > 0) {
        return openSeaNFTs;
      }
    } catch (error) {
      console.warn('OpenSea fetch failed:', error);
    }

    // Fallback to on-chain fetching
    const provider = await getProvider(chainId);
    return await fetchOnChainNFTs(provider, walletAddress, chainId);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}