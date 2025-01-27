export interface MagicEdenNFT {
  mintAddress: string;
  tokenId: string;
  name: string;
  collection: string;
  image?: string;
  owner: string;
}

export interface MagicEdenResponse {
  tokens: MagicEdenNFT[];
}

export interface MagicEdenError {
  code: number;
  message: string;
}