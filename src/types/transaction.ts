import { NFTToken } from './nft';

export interface Transaction {
  id: string;
  fromNFT: NFTToken;
  toNFT: NFTToken;
  fromAddress: string;
  toAddress: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  txHash: string;
  chainId: number;
}

export interface TransactionFilters {
  status?: 'completed' | 'pending' | 'failed';
  chainId?: number;
  timeRange?: 'day' | 'week' | 'month' | 'all';
}