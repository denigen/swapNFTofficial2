import { useState, useCallback } from 'react';
import { NFTToken } from '../../../types/nft';

export function useNFTSelection(initialSelection: NFTToken[] = []) {
  const [selectedNFTs, setSelectedNFTs] = useState<NFTToken[]>(initialSelection);

  const toggleNFT = useCallback((nft: NFTToken) => {
    setSelectedNFTs(current => {
      const isSelected = current.some(n => n.id === nft.id);
      if (isSelected) {
        return current.filter(n => n.id !== nft.id);
      }
      return [...current, nft];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNFTs([]);
  }, []);

  return {
    selectedNFTs,
    toggleNFT,
    clearSelection,
    isSelected: (nft: NFTToken) => selectedNFTs.some(n => n.id === nft.id)
  };
}