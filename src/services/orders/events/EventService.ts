import { Contract } from 'ethers';
import { OrderEvent } from '../types';
import { retryWithBackoff } from '../../../utils/retry';

export class EventService {
  constructor(private readonly contract: Contract) {}

  async getOrderEvents(address: string, fromBlock: number): Promise<OrderEvent[]> {
    try {
      const [makerEvents, takerEvents] = await Promise.all([
        this.getMakerEvents(address, fromBlock),
        this.getTakerEvents(address, fromBlock)
      ]);

      return [...makerEvents, ...takerEvents];
    } catch (error) {
      console.error('Failed to fetch order events:', error);
      throw new Error('Could not load order history');
    }
  }

  private async getMakerEvents(address: string, fromBlock: number) {
    return retryWithBackoff(
      () => {
        const filter = this.contract.filters.SwapOrderCreated(address);
        return this.contract.queryFilter(filter, fromBlock);
      },
      3,
      1000
    );
  }

  private async getTakerEvents(address: string, fromBlock: number) {
    return retryWithBackoff(
      () => {
        const filter = this.contract.filters.SwapOrderCreated(null, null, address);
        return this.contract.queryFilter(filter, fromBlock);
      },
      3,
      1000
    );
  }
}