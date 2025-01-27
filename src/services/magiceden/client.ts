import { MAGICEDEN_CONFIG } from './config';
import { MagicEdenResponse, MagicEdenError } from './types';
import { NFTToken } from '../../types/nft';
import { retryWithBackoff } from '../../utils/retry';

class MagicEdenClient {
  private static instance: MagicEdenClient;

  private constructor() {}

  static getInstance(): MagicEdenClient {
    if (!MagicEdenClient.instance) {
      MagicEdenClient.instance = new MagicEdenClient();
    }
    return MagicEdenClient.instance;
  }

  async fetchWalletNFTs(address: string, chainId: number): Promise<NFTToken[]> {
    if (chainId !== MAGICEDEN_CONFIG.SUPPORTED_CHAINS.APECHAIN) {
      return [];
    }

    try {
      const response = await retryWithBackoff(
        async () => {
          const result = await fetch(
            `${MAGICEDEN_CONFIG.BASE_URL}/wallets/${address}/tokens`,
            {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${MAGICEDEN_CONFIG.API_KEY}`
              }
            }
          );

          if (!result.ok) {
            throw new Error(`MagicEden API error: ${result.status}`);
          }

          return result.json();
        },
        MAGICEDEN_CONFIG.MAX_RETRIES,
        MAGICEDEN_CONFIG.RETRY_DELAY
      );

      return this.mapToNFTTokens(response.tokens, chainId);
    } catch (error) {
      console.error('MagicEden fetch failed:', error);
      return [];
    }
  }

  private mapToNFTTokens(tokens: MagicEdenResponse['tokens'], chainId: number): NFTToken[] {
    return tokens.map(token => ({
      id: `${token.mintAddress}-${token.tokenId}`,
      name: token.name || `NFT #${token.tokenId}`,
      collection: token.collection || 'Unknown Collection',
      imageUrl: token.image || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
      contractAddress: token.mintAddress,
      tokenId: token.tokenId,
      chainId,
      standard: 'ERC721'
    }));
  }
}

export const magicEdenClient = MagicEdenClient.getInstance();