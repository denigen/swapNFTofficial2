import { NFTToken } from '../../types/nft';
import { OKX_CONFIG } from './config';
import { retryWithBackoff } from '../../utils/retry';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400';
const BATCH_SIZE = 50;

export async function fetchOKXNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  if (chainId !== OKX_CONFIG.SUPPORTED_CHAINS.APECHAIN) {
    console.log(`Chain ${chainId} not supported by OKX`);
    return [];
  }

  try {
    const tokens: NFTToken[] = [];
    let page = 1;
    
    do {
      const url = new URL(`${OKX_CONFIG.BASE_URL}/mktplace/nft/asset/detail`);
      url.searchParams.append('address', ownerAddress);
      url.searchParams.append('chainId', chainId.toString());
      url.searchParams.append('limit', BATCH_SIZE.toString());
      url.searchParams.append('page', page.toString());

      console.log('Fetching from OKX:', url.toString());

      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(url, {
            headers: OKX_CONFIG.DEFAULT_HEADERS
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`OKX API error: ${res.status} - ${errorText}`);
          }

          return res.json();
        },
        OKX_CONFIG.MAX_RETRIES,
        OKX_CONFIG.RETRY_DELAY,
        { maxDelay: 5000 }
      );

      if (!response?.data?.length) {
        break;
      }

      const batchTokens = response.data.map((token: any) => ({
        id: `${token.contractAddress}-${token.tokenId}`,
        name: token.name || `ApeChain NFT #${token.tokenId}`,
        collection: token.collectionName || 'Unknown Collection',
        imageUrl: token.imageUrl || DEFAULT_IMAGE,
        contractAddress: token.contractAddress,
        tokenId: token.tokenId,
        chainId,
        standard: 'ERC721'
      }));

      tokens.push(...batchTokens);
      
      // Break if we got less than the batch size (means we're at the end)
      if (batchTokens.length < BATCH_SIZE) {
        break;
      }

      page++;

      console.log(`Fetched batch of ${batchTokens.length} NFTs from OKX`);

      // Add delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));

    } while (true);

    console.log(`Successfully fetched ${tokens.length} total NFTs from OKX`);
    return tokens;
  } catch (error) {
    console.error('OKX fetch failed:', error);
    throw error;
  }
}