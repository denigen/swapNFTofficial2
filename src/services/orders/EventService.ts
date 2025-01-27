import { Contract } from 'ethers';
import { OrderEvent } from './types';
import { BLOCKS_PER_PAGE } from './constants';
import { retryWithBackoff } from '../../utils/retry';

export class EventService {
  constructor(private readonly contract: Contract) {}

  async getOrderEventsPaginated(
    address: string,
    fromBlock: number,
    toBlock: number
  ): Promise<OrderEvent[]> {
    const events: OrderEvent[] = [];
    
    for (let start = fromBlock; start <= toBlock; start += BLOCKS_PER_PAGE) {
      const end = Math.min(start + BLOCKS_PER_PAGE - 1, toBlock);
      
      try {
        const pageEvents = await this.fetchEventsForRange(address, start, end);
        events.push(...pageEvents);
      } catch (error) {
        console.warn(`Error fetching events for blocks ${start}-${end}:`, error);
        // Continue with next page despite errors
      }

      // Add delay between pages
      if (start + BLOCKS_PER_PAGE <= toBlock) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return events;
  }

  private async fetchEventsForRange(
    address: string,
    fromBlock: number,
    toBlock: number
  ): Promise<OrderEvent[]> {
    const [makerEvents, takerEvents] = await Promise.all([
      this.getMakerEvents(address, fromBlock, toBlock),
      this.getTakerEvents(address, fromBlock, toBlock)
    ]);

    return [...makerEvents, ...takerEvents];
  }

  private async getMakerEvents(address: string, fromBlock: number, toBlock: number) {
    return retryWithBackoff(
      async () => {
        const filter = this.contract.filters.SwapOrderCreated(address);
        return this.contract.queryFilter(filter, fromBlock, toBlock);
      },
      3,
      1000
    );
  }

  private async getTakerEvents(address: string, fromBlock: number, toBlock: number) {
    return retryWithBackoff(
      async () => {
        const filter = this.contract.filters.SwapOrderCreated(null, null, address);
        return this.contract.queryFilter(filter, fromBlock, toBlock);
      },
      3,
      1000
    );
  }
}