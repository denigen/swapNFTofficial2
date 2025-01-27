import React from 'react';
import { NFTToken } from '../../types/nft';
import { Loader } from 'lucide-react';
import NFTList from './NFTList';

interface CounterpartyNFTListProps {
  nfts: NFTToken[];
  loading: boolean;
  error: string | null;
  onSelect: (nft: NFTToken) => void;
  selectedNFTs: NFTToken[];
}

export default function CounterpartyNFTList({
  nfts,
  loading,
  error,
  onSelect,
  selectedNFTs
}: CounterpartyNFTListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center space-y-2">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading NFTs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No NFTs found for this address
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <NFTList
        nfts={nfts}
        onSelect={onSelect}
        selectedNFTs={selectedNFTs}
      />
    </div>
  );
}