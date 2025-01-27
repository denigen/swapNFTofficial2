import { Contract } from 'ethers';
import { SwapOrder } from '../../../types/order';
import { NFTMapper } from '../utils/NFTMapper';
import { retryWithBackoff } from '../../../utils/retry';

export class OrderQueryService {
  private nftMapper: NFTMapper;

  constructor(
    private contract: Contract,
    private chainId: number
  ) {
    this.nftMapper = new NFTMapper(chainId);
  }

  async getOrderDetails(orderId: string): Promise<SwapOrder | null> {
    try {
      const order = await retryWithBackoff(
        () => this.contract.swapOrders(orderId),
        3,
        1000
      );

      if (!order.isActive) {
        return null;
      }

      return {
        id: orderId,
        maker: order.maker,
        taker: order.taker,
        makerNFTs: this.nftMapper.mapNFTs(order.makerNFTs),
        takerNFTs: this.nftMapper.mapNFTs(order.takerNFTs),
        createdAt: Number(order.createdAt),
        isActive: order.isActive
      };
    } catch (error) {
      console.warn(`Error fetching order ${orderId}:`, error);
      return null;
    }
  }
}