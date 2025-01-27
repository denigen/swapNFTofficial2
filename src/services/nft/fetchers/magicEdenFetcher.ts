import { NFTToken } from '../../../types/nft';
import { magicEdenClient } from '../../magiceden/client';
import { MAGICEDEN_CONFIG } from '../../magiceden/config';

export async function fetchMagicEdenNFTs(
  address: string,
  chainId: number
): Promise<NFTToken[]> {
  try {
    if (chainId !== MAGICEDEN_CONFIG.SUPPORTED_CHAINS.APECHAIN) {
      return [];
    }

    console.log('Fetching NFTs from MagicEden...');
    return await magicEdenClient.fetchWalletNFTs(address, chainId);
  } catch (error) {
    console.error('MagicEden fetch failed:', error);
    return [];
  }
}