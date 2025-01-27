import { NFTToken } from './nft';

export interface WalletOrder {
  id: string;
  maker: string;
  taker: string;
  makerNFTs: NFTToken[];
  takerNFTs: NFTToken[];
  createdAt: number;
  status: 'pending' | 'completed' | 'cancelled';
  txHash?: string;
}

export interface WalletState {
  orders: WalletOrder[];
  addOrder: (order: WalletOrder) => void;
  updateOrderStatus: (orderId: string, status: WalletOrder['status'], txHash?: string) => void;
  getOrderById: (orderId: string) => WalletOrder | undefined;
  getOrdersByAddress: (address: string) => WalletOrder[];
  clearOrders: () => void;
}