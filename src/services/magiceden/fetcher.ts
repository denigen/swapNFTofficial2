import { NFTToken } from '../../types/nft';
import { MAGICEDEN_CONFIG } from './config';
import { retryWithBackoff } from '../../utils/retry';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400';
const BATCH_SIZE = 50;

export async function fetchMagicEdenNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  // Check if chain is supported
  if (chainId !== MAGICEDEN_CONFIG.SUPPORTED_CHAINS.APECHAIN && 
      chainId !== MAGICEDEN_CONFIG.SUPPORTED_CHAINS.BNB) {
    console.log(`Chain ${chainId} not supported by MagicEden`);
    return [];
  }

  try {
    const tokens: NFTToken[] = [];
    let continuation: string | undefined;
    
    do {
      // Use the correct API endpoint for user tokens
      const url = new URL(`${MAGICEDEN_CONFIG.BASE_URL}/users/${ownerAddress}/tokens/v7`);
      url.searchParams.append('limit', BATCH_SIZE.toString());
      url.searchParams.append('sortBy', 'floorAskPrice');
      url.searchParams.append('sortDirection', 'desc');
      
      if (continuation) {
        url.searchParams.append('continuation', continuation);
      }

      console.log('Fetching from MagicEden:', url.toString());

      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, {
            headers: {
              ...MAGICEDEN_CONFIG.DEFAULT_HEADERS,
              'x-api-key': MAGICEDEN_CONFIG.API_KEY
            }
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error('MagicEden API error response:', errorText);
            throw new Error(`MagicEden API error: ${res.status} - ${errorText}`);
          }

          return res.json();
        },
        MAGICEDEN_CONFIG.MAX_RETRIES,
        MAGICEDEN_CONFIG.RETRY_DELAY,
        { maxDelay: 5000 }
      );

      if (!response?.tokens?.length) {
        break;
      }

      const batchTokens = response.tokens.map((token: any) => {
        // Extract token details with proper null checks
        const tokenData = token.token || {};
        const collection = tokenData.collection || {};
        const ownership = token.ownership || {};

        return {
          id: `${tokenData.contract}-${tokenData.tokenId}`,
          name: tokenData.name || `${collection.name || 'NFT'} #${tokenData.tokenId}`,
          collection: collection.name || 'Unknown Collection',
          imageUrl: tokenData.image || DEFAULT_IMAGE,
          contractAddress: tokenData.contract,
          tokenId: tokenData.tokenId,
          chainId,
          standard: tokenData.kind || 'ERC721',
          balance: ownership.tokenCount ? Number(ownership.tokenCount) : undefined
        };
      });

      tokens.push(...batchTokens);
      continuation = response.continuation;

      console.log(`Fetched batch of ${batchTokens.length} NFTs from MagicEden`);

      if (continuation) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } while (continuation);

    console.log(`Successfully fetched ${tokens.length} total NFTs from MagicEden`);
    return tokens;
  } catch (error) {
    console.error('MagicEden fetch failed:', error);
    return [];
  }
}