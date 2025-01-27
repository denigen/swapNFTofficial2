import { NFTToken } from '../../../types/nft';

export function sortNFTsByCollection(nfts: NFTToken[]): NFTToken[] {
  return [...nfts].sort((a, b) => a.collection.localeCompare(b.collection));
}

export function sortNFTsByName(nfts: NFTToken[]): NFTToken[] {
  return [...nfts].sort((a, b) => a.name.localeCompare(b.name));
}