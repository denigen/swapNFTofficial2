import { Contract } from 'ethers';
import { OrderEvent, SwapOrder } from './types';
import { NFTMapper } from './utils/NFTMapper';
import { retryWithBackoff } from '../../utils/retry';

export class QueryService {
  private nftMapper: NFTMapper;

  constructor(
    private readonly contract: Contract,
    private readonly chainId: number
  ) {
    this.nftMapper = new NFTMapper(chainId);
  }

  async getOrderDetailsForEvents(events: OrderEvent[]): Promise<SwapOrder[]> {
    const orders: SwapOrder[] = [];
    const seenIds = new Set<string>();

    for (const event of events) {
      if (seenIds.has(event.orderId)) continue;
      seenIds.add(event.orderId);

      try {
        const order = await this.getOrderDetails(event.orderId);
        if (order) {
          orders.push(order);
        }
      } catch (error) {
        console.warn(`Failed to fetch order ${event.orderId}:`, error);
      }
    }

    return orders.sort((a, b) => b.createdAt - a.createdAt);
  }

  private async getOrderDetails(orderId: string): Promise<SwapOrder | null> {
    try {
      const order = await retryWithBackoff(
        () => this.contract.swapOrders(orderId),
        3,
        1000
      );

      if (!order.isActive) return null;

      return {
        id: orderId,
        maker: order.maker.toLowerCase(),
        taker: order.taker.toLowerCase(),
        makerNFTs: this.nftMapper.mapNFTs(order.makerNFTs),
        takerNFTs: this.nftMapper.mapNFTs(order.takerNFTs),
        createdAt: Number(order.createdAt),
        isActive: order.isActive,
        status: 'pending'
      };
    } catch (error) {
      console.warn(`Failed to fetch order ${orderId}:`, error);
      return null;
    }
  }
}