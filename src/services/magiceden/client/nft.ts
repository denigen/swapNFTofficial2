import { MagicEdenBaseClient } from './base';
import { NFTToken } from '../../../types/nft';
import { MAGICEDEN_ENDPOINTS } from '../config';

export class MagicEdenNFTClient extends MagicEdenBaseClient {
  async getWalletNFTs(address: string, chainId: number): Promise<NFTToken[]> {
    const response = await this.fetchWithRetry<any[]>(
      `${MAGICEDEN_ENDPOINTS.WALLETS}/${address}/tokens`
    );

    return response.map(nft => ({
      id: `${nft.mintAddress}-${nft.tokenAddress}`,
      name: nft.name || `NFT #${nft.tokenAddress}`,
      collection: nft.collection || 'Unknown Collection',
      imageUrl: nft.image || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
      contractAddress: nft.mintAddress,
      tokenId: nft.tokenAddress,
      chainId,
      standard: 'ERC721'
    }));
  }

  async getCollectionNFTs(collectionSymbol: string): Promise<NFTToken[]> {
    const response = await this.fetchWithRetry<any[]>(
      `${MAGICEDEN_ENDPOINTS.COLLECTIONS}/${collectionSymbol}/listings`
    );

    return response.map(nft => ({
      id: `${nft.mintAddress}-${nft.tokenAddress}`,
      name: nft.name,
      collection: nft.collection,
      imageUrl: nft.image || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
      contractAddress: nft.mintAddress,
      tokenId: nft.tokenAddress,
      chainId: nft.chainId,
      standard: 'ERC721'
    }));
  }
}

export const magicEdenNFTClient = new MagicEdenNFTClient();