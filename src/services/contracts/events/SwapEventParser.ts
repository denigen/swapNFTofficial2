import { Contract, Log } from 'ethers';
import { SwapEvent } from '../types';

export class SwapEventParser {
  constructor(private readonly contract: Contract) {}

  parseSwapEvent(log: Log): SwapEvent | null {
    try {
      // Ensure log is from our contract
      if (log.address.toLowerCase() !== this.contract.target.toLowerCase()) {
        return null;
      }

      // Parse event data
      const event = this.contract.interface.parseLog({
        topics: log.topics,
        data: log.data
      });

      // Validate event name and data
      if (!event || event.name !== 'SwapOrderCreated' || !event.args) {
        console.warn('Invalid event data:', event);
        return null;
      }

      // Extract and validate orderId
      const orderId = event.args.orderId?.toString();
      if (!orderId) {
        console.warn('Missing orderId in event');
        return null;
      }

      return {
        orderId,
        maker: event.args.maker,
        taker: event.args.taker,
        makerNFTs: this.parseNFTDetails(event.args.makerNFTs),
        takerNFTs: this.parseNFTDetails(event.args.takerNFTs),
        blockNumber: log.blockNumber
      };
    } catch (error) {
      console.error('Failed to parse swap event:', error);
      return null;
    }
  }

  private parseNFTDetails(nfts: any[]): { contractAddress: string; tokenId: string }[] {
    return nfts.map(nft => ({
      contractAddress: nft.contractAddress.toLowerCase(),
      tokenId: nft.tokenId.toString()
    }));
  }

  parseSwapEvents(logs: Log[]): SwapEvent[] {
    const events = logs
      .map(log => this.parseSwapEvent(log))
      .filter((event): event is SwapEvent => event !== null);

    if (events.length === 0) {
      console.warn('No valid SwapOrderCreated events found in logs');
    }

    return events;
  }
}