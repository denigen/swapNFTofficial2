import { JsonRpcSigner } from 'ethers';
import { SwapService } from '../../contracts/SwapService';
import { useOrderStore } from '../../../stores/useOrderStore';
import { retryWithBackoff } from '../../../utils/retry';
import { updateOrderStatus } from '../../supabase/orders';

export class OrderExecutionService {
  private swapService: SwapService;

  constructor(chainId: number, signer: JsonRpcSigner) {
    this.swapService = new SwapService(chainId, signer);
  }

  async executeOrder(orderId: string): Promise<{ txHash: string }> {
    try {
      await this.swapService.initialize();

      // Execute the swap with retry
      const txHash = await retryWithBackoff(
        () => this.swapService.executeSwap(orderId),
        3,
        1000
      );

      // Update order status in Supabase
      await updateOrderStatus(orderId, 'completed', txHash);

      // Update order status in local store
      const orderStore = useOrderStore.getState();
      orderStore.updateOrderStatus(orderId, 'completed');

      return { txHash };
    } catch (error) {
      console.error('Order execution failed:', error);
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: any): Error {
    if (error.code === 'ACTION_REJECTED') {
      return new Error('Transaction rejected by user');
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return new Error('Insufficient funds for transaction');
    }
    return new Error(error.message || 'Failed to execute order');
  }
}