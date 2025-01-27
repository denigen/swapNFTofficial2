import { NFTToken } from '../../types/nft';
import { RESERVOIR_CONFIG } from './config';
import { retryWithBackoff } from '../../utils/retry';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400';
const BATCH_SIZE = 50;

export async function fetchReservoirNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  // Check if chain is supported
  const endpoint = getEndpointForChain(chainId);
  if (!endpoint) {
    console.log(`Chain ${chainId} not supported by Reservoir`);
    return [];
  }

  try {
    const tokens: NFTToken[] = [];
    let continuation: string | undefined;
    
    do {
      // Use the correct API endpoint for user tokens
      const url = new URL(`${endpoint}/users/${ownerAddress}/tokens/v7`);
      url.searchParams.append('limit', BATCH_SIZE.toString());
      url.searchParams.append('sortBy', 'floorAskPrice');
      url.searchParams.append('sortDirection', 'desc');
      
      if (continuation) {
        url.searchParams.append('continuation', continuation);
      }

      console.log('Fetching from Reservoir:', url.toString());

      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, {
            headers: {
              ...RESERVOIR_CONFIG.DEFAULT_HEADERS,
              'x-api-key': RESERVOIR_CONFIG.API_KEY
            }
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error('Reservoir API error response:', errorText);
            throw new Error(`Reservoir API error: ${res.status} - ${errorText}`);
          }

          return res.json();
        },
        RESERVOIR_CONFIG.MAX_RETRIES,
        RESERVOIR_CONFIG.RETRY_DELAY,
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

      console.log(`Fetched batch of ${batchTokens.length} NFTs from Reservoir`);

      if (continuation) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } while (continuation);

    console.log(`Successfully fetched ${tokens.length} total NFTs from Reservoir`);
    return tokens;
  } catch (error) {
    console.error('Reservoir fetch failed:', error);
    return [];
  }
}

function getEndpointForChain(chainId: number): string | null {
  switch (chainId) {
    case RESERVOIR_CONFIG.SUPPORTED_CHAINS.APECHAIN:
      return RESERVOIR_CONFIG.ENDPOINTS.APECHAIN;
    case RESERVOIR_CONFIG.SUPPORTED_CHAINS.BNB:
      return RESERVOIR_CONFIG.ENDPOINTS.BNB;
    default:
      return null;
  }
}