import React from 'react';

interface NFTCardInfoProps {
  name: string;
  collection: string;
  balance?: number;
  standard?: 'ERC721' | 'ERC1155';
}

export default function NFTCardInfo({ name, collection, balance, standard }: NFTCardInfoProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
      <p className="text-white font-medium text-sm truncate">{name}</p>
      <div className="flex justify-between items-center">
        <p className="text-gray-300 text-xs truncate">{collection}</p>
        {standard === 'ERC1155' && balance && (
          <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full text-white">
            x{balance}
          </span>
        )}
      </div>
    </div>
  );
}