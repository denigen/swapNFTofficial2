import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { SwapService } from '../services/contracts/swap';
import { SwapParams } from '../services/contracts/types';

export function useSwapCreation() {
  const { signer } = useWalletStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSwap = async (params: SwapParams) => {
    if (!signer) {
      setError('Wallet not connected');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsCreating(true);
    setError(null);

    try {
      const swapService = new SwapService(signer);
      await swapService.initialize();
      
      const result = await swapService.createSwap(params);
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create swap';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createSwap,
    isCreating,
    error
  };
}