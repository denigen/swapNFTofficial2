import { useState, useEffect, useCallback } from 'react';
import { NFTToken } from '../types/nft';
import { fetchWalletNFTs } from '../services/nft';
import { useWalletStore } from '../stores/useWalletStore';
import { retryWithBackoff } from '../utils/retry';

export function useNetworkNFTs() {
  const { address, chainId, isConnected } = useWalletStore();
  const [state, setState] = useState<{
    nfts: NFTToken[];
    isLoading: boolean;
    error: string | null;
  }>({
    nfts: [],
    isLoading: false,
    error: null
  });

  const fetchNFTs = useCallback(async () => {
    if (!isConnected || !address || !chainId) {
      setState(prev => ({ ...prev, nfts: [], error: null }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log(`Fetching NFTs for ${address} on chain ${chainId}`);
      const fetchedNFTs = await retryWithBackoff(
        () => fetchWalletNFTs(address, chainId),
        3,
        1000,
        { maxDelay: 5000 }
      );

      setState({
        nfts: fetchedNFTs,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setState({
        nfts: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NFTs'
      });
    }
  }, [address, chainId, isConnected]);

  // Initial fetch
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  return { ...state, refreshNFTs: fetchNFTs };
}