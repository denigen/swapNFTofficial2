import { useState, useEffect, useCallback } from 'react';
import { NFTToken } from '../../types/nft';
import { fetchOpenSeaNFTs } from '../../services/opensea/fetcher';
import { openSeaClient } from '../../services/opensea/client';
import { OpenSeaError } from '../../services/opensea/utils';
import { OPENSEA_CONFIG } from '../../services/opensea/constants';

interface OpenSeaNFTsState {
  nfts: NFTToken[];
  isLoading: boolean;
  error: string | null;
}

export function useOpenSeaNFTs(address: string | null, chainId: number | null) {
  const [state, setState] = useState<OpenSeaNFTsState>({
    nfts: [],
    isLoading: false,
    error: null
  });

  const fetchNFTs = useCallback(async (controller: AbortController) => {
    if (!address || !chainId) {
      setState(prev => ({
        ...prev,
        error: !address ? 'No address provided' : 'Invalid chain ID',
        nfts: []
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const nfts = await fetchOpenSeaNFTs(address, chainId, {
        signal: controller.signal,
        timeout: OPENSEA_CONFIG.REQUEST_TIMEOUT,
        retries: OPENSEA_CONFIG.MAX_RETRIES
      });

      if (!controller.signal.aborted) {
        setState({
          nfts,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error instanceof OpenSeaError) {
          setState({
            nfts: [],
            isLoading: false,
            error: error.message
          });
        } else if (!(error instanceof Error && error.name === 'AbortError')) {
          setState({
            nfts: [],
            isLoading: false,
            error: 'Failed to fetch NFTs'
          });
        }
      }
    }
  }, [address, chainId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchNFTs(controller);

    return () => {
      controller.abort();
      openSeaClient.cancelRequests();
    };
  }, [fetchNFTs]);

  return state;
}