import { useState, useEffect } from 'react';
import { NFTToken } from '../types/nft';
import { fetchOpenSeaNFTs } from '../services/opensea/fetcher';
import { openSeaClient } from '../services/opensea/client';

export function useOpenSeaNFTs(address: string | null, chainId: number | null) {
  const [state, setState] = useState<{
    nfts: NFTToken[];
    isLoading: boolean;
    error: string | null;
  }>({
    nfts: [],
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!address || !chainId) {
      setState(prev => ({
        ...prev,
        error: address ? 'Invalid chain ID' : 'No address provided',
        nfts: []
      }));
      return;
    }

    const controller = new AbortController();
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    fetchOpenSeaNFTs(address, chainId, { signal: controller.signal })
      .then(nfts => {
        setState({
          nfts,
          isLoading: false,
          error: null
        });
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          setState({
            nfts: [],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch NFTs'
          });
        }
      });

    return () => {
      controller.abort();
      openSeaClient.cancelRequests();
    };
  }, [address, chainId]);

  return state;
}