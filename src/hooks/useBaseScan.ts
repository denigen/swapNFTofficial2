import { useState, useCallback } from 'react';
import { basescan, TokenTransferEvent, BaseScanError } from '../services/basescan';

interface UseBaseScanResult {
  getTokenTransfers: (
    contractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => Promise<void>;
  transfers: TokenTransferEvent[];
  isLoading: boolean;
  error: string | null;
}

export function useBaseScan(): UseBaseScanResult {
  const [transfers, setTransfers] = useState<TokenTransferEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenTransfers = useCallback(async (
    contractAddress: string,
    fromBlock?: number,
    toBlock?: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await basescan.token.getTokenTransfers(
        contractAddress,
        fromBlock,
        toBlock
      );
      setTransfers(result);
    } catch (err) {
      console.error('BaseScan API error:', err);
      if (err instanceof BaseScanError) {
        setError(err.message);
      } else {
        setError('Failed to fetch token transfers');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getTokenTransfers,
    transfers,
    isLoading,
    error
  };
}