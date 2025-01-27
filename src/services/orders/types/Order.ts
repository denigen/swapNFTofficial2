export interface Order {
  id: string;
  maker: string;
  taker: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'cancelled';
  makerNFTs: NFTDetails[];
  takerNFTs: NFTDetails[];
  isActive: boolean;
}

export interface NFTDetails {
  id: string;
  name: string;
  collection: string;
  imageUrl: string;
  contractAddress: string;
  tokenId: string;
  standard: 'ERC721' | 'ERC1155';
  balance?: number;
}

export interface OrderQueryOptions {
  address: string;
  chainId: number;
  status?: 'pending' | 'completed' | 'cancelled';
}

export interface OrderQueryResult {
  orders: Order[];
  error?: string;
  isLoading: boolean;
}