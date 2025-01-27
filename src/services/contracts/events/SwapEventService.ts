import { Contract } from 'ethers';
import { SwapEvent, EventQueryOptions } from '../types';
import { retryWithBackoff } from '../../../utils/retry';

export class SwapEventService {
  constructor(private contract: Contract) {}

  async getSwapEvents(
    address: string,
    options: EventQueryOptions
  ): Promise<SwapEvent[]> {
    try {
      // Create filter with proper parameters
      const filter = this.contract.filters.SwapOrderCreated(null, null, address);
      const events = await retryWithBackoff(
        () => this.contract.queryFilter(filter, options.fromBlock, options.toBlock),
        3,
        1000,
        { maxDelay: 5000 }
      );

      return events.map(event => ({
        orderId: event.args.orderId,
        maker: event.args.maker,
        taker: event.args.taker,
        makerNFTs: event.args.makerNFTs,
        takerNFTs: event.args.takerNFTs,
        blockNumber: event.blockNumber
      }));
    } catch (error) {
      console.error('Error fetching swap events:', error);
      return [];
    }
  }
}