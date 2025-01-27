import { Contract } from 'ethers';
import { retryWithBackoff } from '../../utils/retry';

export class OrderEventService {
  constructor(private readonly contract: Contract) {}

  async getOrderEvents(address: string, fromBlock: number) {
    try {
      // Get both maker and taker events with retry
      const [makerEvents, takerEvents] = await Promise.all([
        retryWithBackoff(
          () => this.getMakerEvents(address, fromBlock),
          3,
          1000,
          { maxDelay: 5000 }
        ),
        retryWithBackoff(
          () => this.getTakerEvents(address, fromBlock),
          3,
          1000,
          { maxDelay: 5000 }
        )
      ]);

      return [...makerEvents, ...takerEvents];
    } catch (error) {
      console.error('Failed to fetch order events:', error);
      throw new Error('Failed to load order history');
    }
  }

  private async getMakerEvents(address: string, fromBlock: number) {
    // Get events where user is maker
    const filter = this.contract.filters.SwapOrderCreated(
      address.toLowerCase()
    );
    return this.contract.queryFilter(filter, fromBlock);
  }

  private async getTakerEvents(address: string, fromBlock: number) {
    // Get events where user is taker
    const filter = this.contract.filters.SwapOrderCreated(
      null,
      null,
      address.toLowerCase()
    );
    return this.contract.queryFilter(filter, fromBlock);
  }
}