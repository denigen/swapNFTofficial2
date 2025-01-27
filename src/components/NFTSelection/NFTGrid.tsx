import React from 'react';
import { NFTToken } from '../../types/nft';
import { Check } from 'lucide-react';

interface NFTGridProps {
  nfts: NFTToken[];
  onSelect: (nft: NFTToken) => void;
  selectedNFTs: NFTToken[];
  multiSelect: boolean;
}

export default function NFTGrid({ nfts, onSelect, selectedNFTs, multiSelect }: NFTGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {nfts.map((nft) => {
        const isSelected = selectedNFTs.some(n => n.id === nft.id);
        
        return (
          <button
            key={nft.id}
            onClick={() => onSelect(nft)}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
              isSelected
                ? 'border-blue-500 shadow-lg'
                : 'border-transparent hover:border-gray-300'
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
              <p className="text-white font-medium text-sm truncate">{nft.name}</p>
              <p className="text-gray-300 text-xs truncate">{nft.collection}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}