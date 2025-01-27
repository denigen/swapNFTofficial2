import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { swapService } from '../services/contracts/swapService';

export function useExecuteSwap() {
  const { signer } = useWalletStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSwap = async (orderId: string) => {
    if (!signer) {
      setError('Wallet not connected');
      return false;
    }

    setIsExecuting(true);
    setError(null);

    try {
      await swapService.executeSwap(orderId, signer);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute swap');
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  return { executeSwap, isExecuting, error };
}