import React from 'react';
import { NFTToken } from '../../types/nft';
import { Check } from 'lucide-react';
import { formatAddress } from '../../utils/addressUtils';

interface NFTListProps {
  nfts: NFTToken[];
  onSelect?: (nft: NFTToken) => void;
  selectedNFTs?: NFTToken[];
}

export default function NFTList({ nfts, onSelect, selectedNFTs = [] }: NFTListProps) {
  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No NFTs found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {nfts.map((nft) => {
        const isSelected = selectedNFTs.some(n => n.id === nft.id);
        
        return (
          <div
            key={nft.id}
            onClick={() => onSelect?.(nft)}
            className={`flex items-center justify-between py-3 px-4 ${
              onSelect ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
            } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {nft.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{nft.collection}</span>
                    <span>•</span>
                    <span>ID: {nft.tokenId}</span>
                    <span>•</span>
                    <span>Contract: {formatAddress(nft.contractAddress)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {nft.standard === 'ERC1155' && nft.balance && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                x{nft.balance}
              </span>
            )}
            
            {isSelected && (
              <Check className="w-5 h-5 text-blue-500 ml-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}