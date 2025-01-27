import React from 'react';
import { NFTToken } from '../../../types/nft';

interface NFTListProps {
  nfts: NFTToken[];
}

export function NFTList({ nfts }: NFTListProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {nfts.map((nft) => (
        <div key={nft.id} className="relative aspect-square rounded-lg overflow-hidden">
          <img 
            src={nft.imageUrl} 
            alt={nft.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-center p-2">
              <p className="text-white text-sm font-medium truncate">{nft.name}</p>
              <p className="text-gray-300 text-xs truncate">{nft.collection}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}