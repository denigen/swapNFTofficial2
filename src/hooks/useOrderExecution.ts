import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { OrderExecutionService } from '../services/orders/execution/OrderExecutionService';

export function useOrderExecution() {
  const { chainId, signer } = useWalletStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const executeOrder = async (orderId: string) => {
    if (!chainId || !signer) {
      setError('Wallet not connected');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setTxHash(null);

    try {
      const executionService = new OrderExecutionService(chainId, signer);
      const result = await executionService.executeOrder(orderId);
      setTxHash(result.txHash);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute order';
      console.error('Order execution failed:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeOrder,
    isExecuting,
    error,
    txHash
  };
}