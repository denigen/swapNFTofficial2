import React from 'react';
import { NFTToken } from '../../types/nft';

interface NFTSelectionListProps {
  nfts: NFTToken[];
}

const NFTSelectionList: React.FC<NFTSelectionListProps> = ({ nfts }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {nfts.map((nft) => (
        <div
          key={nft.id}
          className="relative flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <img src={nft.imageUrl} alt={nft.name} className="w-10 h-10 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate dark:text-gray-200">{nft.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{nft.collection}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NFTSelectionList;