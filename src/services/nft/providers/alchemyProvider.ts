// This file is kept for reference but no longer used for ApeChain
import { NFTToken } from '../../../types/nft';
import { ALCHEMY_CONFIG } from '../../../config/api/alchemy';
import { retryWithBackoff } from '../../../utils/retry';

export async function fetchAlchemyNFTs(
  ownerAddress: string,
  chainId: number
): Promise<NFTToken[]> {
  // Return empty array for ApeChain since we're using Reservoir instead
  if (chainId === 33139) {
    return [];
  }

  // Rest of the function remains unchanged for other chains
  try {
    const url = `${ALCHEMY_CONFIG.BASE_URL}/${ALCHEMY_CONFIG.API_KEY}/getNFTs/?owner=${ownerAddress}`;
    console.log('Fetching from Alchemy:', url);

    const response = await retryWithBackoff(
      async () => {
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error(`Alchemy API error: ${res.status}`);
        }

        return res.json();
      },
      ALCHEMY_CONFIG.MAX_RETRIES,
      ALCHEMY_CONFIG.RETRY_DELAY
    );

    if (!response?.ownedNfts?.length) {
      console.log('No NFTs found on Alchemy');
      return [];
    }

    const mappedNFTs = response.ownedNfts.map((nft: any) => ({
      id: `${nft.contract.address}-${nft.id.tokenId}`,
      name: nft.title || `${nft.contractMetadata?.name || 'Unknown'} #${nft.id.tokenId}`,
      collection: nft.contractMetadata?.name || 'Unknown Collection',
      imageUrl: nft.media?.[0]?.gateway || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
      contractAddress: nft.contract.address,
      tokenId: nft.id.tokenId,
      chainId,
      standard: nft.id.tokenMetadata?.tokenType || 'ERC721',
      balance: nft.balance ? Number(nft.balance) : undefined
    }));

    console.log(`Successfully mapped ${mappedNFTs.length} NFTs from Alchemy`);
    return mappedNFTs;
  } catch (error) {
    console.error('Error fetching from Alchemy:', error);
    return [];
  }
}