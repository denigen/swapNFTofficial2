import React from 'react';
import { NFTToken } from '../../../types/nft';

interface NFTPreviewProps {
  nft: NFTToken;
}

export function NFTPreview({ nft }: NFTPreviewProps) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden group">
      <img 
        src={nft.imageUrl} 
        alt={nft.name} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-center p-2">
          <p className="text-white text-sm font-medium truncate">{nft.name}</p>
          <p className="text-gray-300 text-xs truncate">{nft.collection}</p>
          {nft.standard === 'ERC1155' && nft.balance && (
            <p className="text-blue-300 text-xs mt-1">x{nft.balance}</p>
          )}
        </div>
      </div>
    </div>
  );
}