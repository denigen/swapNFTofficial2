import { SwapOrder } from '../../types/order';

export interface OrderEventOptions {
  fromBlock: number;
  toBlock?: number;
}

export interface OrderQueryOptions {
  chainId: number;
  address: string;
}

export interface OrderEventResult {
  orderId: string;
  maker: string;
  taker: string;
  blockNumber: number;
}