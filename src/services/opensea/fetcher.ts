import { NFTToken } from '../../types/nft';
import { OPENSEA_CONFIG } from './config';
import { retryWithBackoff } from '../../utils/retry';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400';

export async function fetchOpenSeaNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  const chainName = OPENSEA_CONFIG.CHAIN_NAMES[chainId];
  if (!chainName) {
    console.log(`Chain ${chainId} not supported by OpenSea`);
    return [];
  }

  try {
    const url = `${OPENSEA_CONFIG.BASE_URL}/chain/${chainName}/account/${ownerAddress}/nfts`;
    console.log('Fetching from OpenSea:', url);

    const response = await retryWithBackoff(
      async () => {
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'X-API-KEY': OPENSEA_CONFIG.API_KEY
          }
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`OpenSea API error: ${res.status} - ${errorText}`);
        }

        return res.json();
      },
      3,
      1000,
      { maxDelay: 5000 }
    );

    if (!response?.nfts?.length) {
      console.log('No NFTs found on OpenSea');
      return [];
    }

    const mappedNFTs = response.nfts.map(asset => ({
      id: `${asset.contract}-${asset.identifier}`,
      name: asset.name || `${asset.collection} #${asset.identifier}`,
      collection: asset.collection,
      imageUrl: asset.image_url || DEFAULT_IMAGE,
      contractAddress: asset.contract,
      tokenId: asset.identifier,
      chainId,
      standard: asset.token_standard || 'ERC721',
      balance: asset.token_standard === 'ERC1155' ? Number(asset.balance) : undefined
    }));

    console.log(`Successfully mapped ${mappedNFTs.length} NFTs from OpenSea`);
    return mappedNFTs;
  } catch (error) {
    console.error('OpenSea fetch failed:', error);
    throw error;
  }
}