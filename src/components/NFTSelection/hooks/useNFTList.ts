import { useMemo } from 'react';
import { NFTToken } from '../../../types/nft';

export function useNFTList(nfts: NFTToken[], searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery) return nfts;
    
    const query = searchQuery.toLowerCase();
    return nfts.filter(nft => 
      nft.name.toLowerCase().includes(query) ||
      nft.collection.toLowerCase().includes(query)
    );
  }, [nfts, searchQuery]);
}