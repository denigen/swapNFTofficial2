import { useState, useEffect } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { swapService } from '../services/contracts/swapService';

export function useSwapContract() {
  const { chainId } = useWalletStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (!chainId) return;

      try {
        await swapService.initialize(chainId);
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize contract');
        setIsInitialized(false);
      }
    };

    initializeContract();
  }, [chainId]);

  return { isInitialized, error };
}