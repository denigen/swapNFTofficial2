import { useState, useCallback } from 'react';
import { NFTToken } from '../types/nft';
import { fetchWalletNFTs } from '../services/nft';
import { isValidAddress } from '../utils/addressUtils';

export function useNFTFetching() {
  const [state, setState] = useState<{
    nfts: NFTToken[];
    isLoading: boolean;
    error: string | null;
  }>({
    nfts: [],
    isLoading: false,
    error: null
  });

  const fetchNFTs = useCallback(async (address: string, chainId: number) => {
    if (!address || !chainId) {
      setState(prev => ({
        ...prev,
        error: 'Missing address or chain ID',
        nfts: []
      }));
      return;
    }

    if (!isValidAddress(address)) {
      setState(prev => ({
        ...prev,
        error: 'Invalid wallet address',
        nfts: []
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(`Fetching NFTs for ${address} on chain ${chainId}`);
      const fetchedNFTs = await fetchWalletNFTs(address, chainId);
      
      setState({
        nfts: fetchedNFTs,
        isLoading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setState({
        nfts: [],
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch NFTs'
      });
    }
  }, []);

  const clearNFTs = useCallback(() => {
    setState({
      nfts: [],
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    fetchNFTs,
    clearNFTs
  };
}