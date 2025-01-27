export interface OpenSeaAsset {
  identifier: string;
  collection: string;
  contract: string;
  name: string;
  image_url: string;
  token_standard: 'ERC721' | 'ERC1155';
  balance?: string;
}

export interface OpenSeaResponse {
  nfts: OpenSeaAsset[];
  next?: string;
}

export interface OpenSeaError {
  status: number;
  message: string;
  details?: string;
}