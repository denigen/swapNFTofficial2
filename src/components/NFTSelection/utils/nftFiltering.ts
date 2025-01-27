import { NFTToken } from '../../../types/nft';

export function filterByStandard(nfts: NFTToken[], standard?: 'ERC721' | 'ERC1155'): NFTToken[] {
  if (!standard) return nfts;
  return nfts.filter(nft => nft.standard === standard);
}

export function filterByCollection(nfts: NFTToken[], collection?: string): NFTToken[] {
  if (!collection) return nfts;
  return nfts.filter(nft => nft.collection === collection);
}