import { NFTDetails } from '../types/Order';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400';

export class NFTMapper {
  constructor(private readonly chainId: number) {}

  mapNFTs(nfts: any[]): NFTDetails[] {
    return nfts.map(nft => ({
      id: `${nft.contractAddress}-${nft.tokenId}`,
      name: `NFT #${nft.tokenId}`,
      collection: 'Collection',
      imageUrl: DEFAULT_IMAGE,
      contractAddress: nft.contractAddress.toLowerCase(),
      tokenId: nft.tokenId.toString(),
      standard: 'ERC721',
      balance: nft.balance ? Number(nft.balance) : undefined
    }));
  }
}