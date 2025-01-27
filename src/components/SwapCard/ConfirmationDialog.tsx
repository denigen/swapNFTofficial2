import React from 'react';
import { NFTToken } from '../../types/nft';
import { ArrowRight } from 'lucide-react';

interface ConfirmationDialogProps {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming: boolean;
}

export default function ConfirmationDialog({
  fromNFTs,
  toNFTs,
  onConfirm,
  onCancel,
  isConfirming
}: ConfirmationDialogProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-4">
          Confirm NFT Swap
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              You'll Send
            </p>
            <div className="space-y-2">
              {fromNFTs.map(nft => (
                <div 
                  key={nft.id}
                  className="bg-white dark:bg-gray-800 p-2 rounded-lg flex items-center space-x-2"
                >
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{nft.name}</p>
                    <p className="text-xs text-gray-500">{nft.collection}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />

          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              You'll Receive
            </p>
            <div className="space-y-2">
              {toNFTs.map(nft => (
                <div 
                  key={nft.id}
                  className="bg-white dark:bg-gray-800 p-2 rounded-lg flex items-center space-x-2"
                >
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{nft.name}</p>
                    <p className="text-xs text-gray-500">{nft.collection}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          disabled={isConfirming}
          className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isConfirming}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConfirming ? 'Confirming...' : 'Confirm Swap'}
        </button>
      </div>
    </div>
  );
}