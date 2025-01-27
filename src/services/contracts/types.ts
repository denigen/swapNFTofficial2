export interface SwapEvent {
  orderId: string;
  maker: string;
  taker: string;
  makerNFTs: NFTDetails[];
  takerNFTs: NFTDetails[];
}

export interface NFTDetails {
  contractAddress: string;
  tokenId: string;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  orderId?: string;
  error?: string;
}

export interface CreateSwapParams {
  fromNFTs: NFTDetails[];
  toNFTs: NFTDetails[];
  counterpartyAddress: string;
}