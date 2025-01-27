import React from 'react';
import { NFTToken } from '../../types/nft';
import { Check } from 'lucide-react';

interface NFTCardProps {
  nft: NFTToken;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function NFTCard({ nft, isSelected, onClick }: NFTCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <img
        src={nft.imageUrl}
        alt={nft.name}
        className="w-full aspect-square object-cover"
      />
      
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white font-medium text-sm truncate">
          {nft.name}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-gray-300 text-xs truncate">
            {nft.collection}
          </p>
          {nft.standard === 'ERC1155' && nft.balance && (
            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full text-white">
              x{nft.balance}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}