import { NFTToken } from '../../../types/nft';

export class NFTMapper {
  constructor(private chainId: number) {}

  mapNFTs(nfts: any[]): NFTToken[] {
    return nfts.map(nft => ({
      id: `${nft.contractAddress}-${nft.tokenId}`,
      contractAddress: nft.contractAddress,
      tokenId: nft.tokenId.toString(),
      name: `NFT #${nft.tokenId}`,
      collection: 'Collection',
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
      chainId: this.chainId
    }));
  }
}