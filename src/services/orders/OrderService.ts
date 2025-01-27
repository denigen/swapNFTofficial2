import { Contract } from 'ethers';
import { NFT_SWAP_ABI } from '../../config/contracts/abis/nftSwap';
import { getProvider } from '../../utils/providers/rpcProvider';
import { getContractAddress } from '../../config/contracts/addresses';
import { orderApi } from '../base/api/orderApi';
import { SwapOrder } from '../../types/order';
import { retryWithBackoff } from '../../utils/retry';
import { validateOrderServiceParams } from './utils/validation';
import { sortOrdersByDate, deduplicateOrders } from './utils/orderUtils';
import { ORDER_SERVICE_ERRORS } from './constants/errors';

export class OrderService {
  private contract: Contract | null = null;

  constructor(private readonly chainId: number) {}

  async initialize(): Promise<void> {
    if (this.contract) return;

    try {
      const provider = await getProvider(this.chainId);
      const address = getContractAddress(this.chainId, 'NFT_SWAP');
      this.contract = new Contract(address, NFT_SWAP_ABI, provider);
    } catch (error) {
      console.error('Failed to initialize OrderService:', error);
      throw new Error(ORDER_SERVICE_ERRORS.NOT_INITIALIZED);
    }
  }

  async getPendingOrders(address: string): Promise<SwapOrder[]> {
    validateOrderServiceParams(address);

    if (!this.contract) {
      throw new Error(ORDER_SERVICE_ERRORS.NOT_INITIALIZED);
    }

    try {
      // Get current block with retry
      const currentBlock = await retryWithBackoff(
        () => this.contract!.provider.getBlockNumber(),
        3,
        1000
      );

      // Get events from BASE API
      const events = await orderApi.getOrderEvents(
        this.contract.target,
        Math.max(currentBlock - 10000, 0)
      );

      // Process orders
      const orders: SwapOrder[] = [];
      for (const event of events) {
        try {
          const order = await orderApi.getOrderDetails(event.orderId);
          if (order && this.isRelevantOrder(order, address)) {
            const isValid = await orderApi.validateOrder(order);
            if (isValid) {
              orders.push(order);
            }
          }
        } catch (error) {
          console.warn(`Failed to process order ${event.orderId}:`, error);
          continue;
        }
      }

      return sortOrdersByDate(deduplicateOrders(orders));
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw new Error(ORDER_SERVICE_ERRORS.FETCH_FAILED);
    }
  }

  private isRelevantOrder(order: SwapOrder, address: string): boolean {
    const normalizedAddress = address.toLowerCase();
    return (
      order.isActive &&
      (order.maker.toLowerCase() === normalizedAddress || 
       order.taker.toLowerCase() === normalizedAddress)
    );
  }
}