import React from 'react';
import { NFTToken } from '../../types/nft';
import NFTList from '../NFTSelection/NFTList';

interface NFTSelectionProps {
  label: string;
  nfts: NFTToken[];
  onClick: () => void;
}

export default function NFTSelection({ label, nfts, onClick }: NFTSelectionProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Selected: {nfts.length}
        </span>
      </div>
      
      {nfts.length > 0 ? (
        <div className="space-y-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <NFTList nfts={nfts} />
          </div>
          <button 
            onClick={onClick}
            className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Add More NFTs
          </button>
        </div>
      ) : (
        <button 
          className="w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          onClick={onClick}
        >
          <span className="text-gray-500 dark:text-gray-400">Select NFTs</span>
        </button>
      )}
    </div>
  );
}