import { useState, useEffect } from 'react';
import { NFTToken } from '../types/nft';
import { getCounterpartyNFTs } from '../services/supabase/nftSync';
import { isValidAddress } from '../utils/addressUtils';
import { retryWithBackoff } from '../utils/retry';

export function useCounterpartyNFTs(address: string | null, chainId: number | null) {
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

    if (!isValidAddress(address)) {
      setState(prev => ({
        ...prev,
        error: 'Invalid wallet address',
        nfts: []
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const loadNFTs = async () => {
      try {
        console.log(`Fetching counterparty NFTs for ${address} on chain ${chainId}`);
        
        const nfts = await retryWithBackoff(
          () => getCounterpartyNFTs(address, chainId),
          3,
          1000,
          { maxDelay: 5000 }
        );
        
        setState({
          nfts,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching counterparty NFTs:', err);
        setState({
          nfts: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch NFTs'
        });
      }
    };

    loadNFTs();
  }, [address, chainId]);

  return state;
}