import { useState, useCallback } from 'react';
import { NFTToken } from '../types/nft';
import { fetchAllNFTs } from '../services/nft/fetchers';
import { syncNFTs } from '../services/supabase/nftSync';
import { useWalletStore } from '../stores/useWalletStore';
import { retryWithBackoff } from '../utils/retry';

export function useNFTSelection() {
  const { address, chainId, isConnected } = useWalletStore();
  const [state, setState] = useState<{
    ownedNFTs: NFTToken[];
    isLoading: boolean;
    error: string | null;
  }>({
    ownedNFTs: [],
    isLoading: false,
    error: null
  });

  const refreshNFTs = useCallback(async () => {
    if (!isConnected || !address || !chainId) {
      setState(prev => ({
        ...prev,
        error: !isConnected ? 'Wallet not connected' : 'Missing address or chain ID',
        ownedNFTs: []
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const nfts = await retryWithBackoff(
        () => fetchAllNFTs(address, chainId),
        3,
        1000,
        { maxDelay: 5000 }
      );

      // Sync NFTs to Supabase
      await syncNFTs(address, nfts, chainId);

      setState({
        ownedNFTs: nfts,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.error('Error loading NFTs:', err);
      setState({
        ownedNFTs: [],
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load NFTs'
      });
    }
  }, [address, chainId, isConnected]);

  return {
    ...state,
    refreshNFTs
  };
}