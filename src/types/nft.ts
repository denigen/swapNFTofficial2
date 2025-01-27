export interface NFTToken {
  id: string;
  name: string;
  collection: string;
  imageUrl: string;
  contractAddress: string;
  tokenId: string;
  chainId: number;
  standard?: 'ERC721' | 'ERC1155';
  balance?: number; // For ERC1155 tokens
}

export interface NFTSelection {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}