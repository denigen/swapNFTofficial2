import { SwapService } from '../contracts/SwapService';
import { SwapOrder } from '../../types/order';
import { EventService } from './EventService';
import { QueryService } from './QueryService';
import { calculateBlockRange } from './utils/blockRange';
import { retryWithBackoff } from '../../utils/retry';

export class OrdersService {
  private eventService: EventService | null = null;
  private queryService: QueryService | null = null;
  private initialized = false;

  constructor(
    private readonly chainId: number,
    private readonly signer: any
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const swapService = new SwapService(this.chainId, this.signer);
      await swapService.initialize();

      const contract = swapService.getContract();
      this.eventService = new EventService(contract);
      this.queryService = new QueryService(contract, this.chainId);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OrdersService:', error);
      throw new Error('Failed to initialize orders service');
    }
  }

  async executeOrder(orderId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const swapService = new SwapService(this.chainId, this.signer);
      await swapService.initialize();
      await swapService.executeSwap(orderId);
    } catch (error) {
      console.error('Failed to execute order:', error);
      throw error;
    }
  }
}