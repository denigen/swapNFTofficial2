import { useState, useEffect } from 'react';
import { NFTToken } from '../types/nft';
import { fetchNFTs } from '../utils/nftUtils';

export function useNFTs(chainId: number, searchQuery: string) {
  const [nfts, setNFTs] = useState<NFTToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadNFTs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchedNFTs = await fetchNFTs(chainId, searchQuery);
        if (mounted) {
          setNFTs(fetchedNFTs);
        }
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
          setNFTs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNFTs();

    return () => {
      mounted = false;
    };
  }, [chainId, searchQuery]);

  return { nfts, loading, error };
}