import { NFTToken } from '../../../types/nft';

export interface SwapParams {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
  counterpartyAddress: string;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  orderId?: string;
  error?: string;
}