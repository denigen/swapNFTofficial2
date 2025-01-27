import React from 'react';
import { NFTToken } from '../../types/nft';
import { Loader } from 'lucide-react';

interface NFTSelectionTabsProps {
  selectedTab: 'owned' | 'counterparty';
  onTabChange: (tab: 'owned' | 'counterparty') => void;
  ownedNFTs: NFTToken[];
  counterpartyNFTs: NFTToken[];
  isLoading: boolean;
  error: string | null;
}

export default function NFTSelectionTabs({
  selectedTab,
  onTabChange,
  ownedNFTs,
  counterpartyNFTs,
  isLoading,
  error
}: NFTSelectionTabsProps) {
  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onTabChange('owned')}
          className={`px-4 py-2 -mb-px ${
            selectedTab === 'owned'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Your NFTs ({ownedNFTs.length})
        </button>
        <button
          onClick={() => onTabChange('counterparty')}
          className={`px-4 py-2 -mb-px ${
            selectedTab === 'counterparty'
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          Counterparty NFTs ({counterpartyNFTs.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center space-y-2">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading NFTs...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedTab === 'owned' ? (
            <NFTList
              nfts={ownedNFTs}
              emptyMessage="No NFTs found in your wallet"
            />
          ) : (
            <NFTList
              nfts={counterpartyNFTs}
              emptyMessage="No NFTs found in counterparty wallet"
            />
          )}
        </div>
      )}
    </div>
  );
}

function NFTList({ nfts, emptyMessage }: { nfts: NFTToken[]; emptyMessage: string }) {
  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
}