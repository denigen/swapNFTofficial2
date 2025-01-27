import { NFTToken } from './nft';

export interface SwapOrder {
  id: string;
  maker: string;
  taker: string;
  makerNFTs: NFTToken[];
  takerNFTs: NFTToken[];
  createdAt: number;
  isActive: boolean;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface OrderFilters {
  status?: 'pending' | 'completed' | 'cancelled';
  chainId?: number;
}