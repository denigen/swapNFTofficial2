import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal/Modal';
import { NFTToken } from '../../types/nft';
import { useWalletStore } from '../../stores/useWalletStore';
import { Search } from 'lucide-react';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import { isValidAddress } from '../../utils/addressUtils';
import { fetchAllNFTs } from '../../services/nft/fetchers';
import { retryWithBackoff } from '../../utils/retry';

interface NFTSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nfts: NFTToken[]) => void;
  selectedNFTs: NFTToken[];
  multiSelect?: boolean;
  counterpartyAddress?: string;
}

interface CollectionGroup {
  name: string;
  nfts: NFTToken[];
}

export default function NFTSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedNFTs,
  multiSelect = true,
  counterpartyAddress
}: NFTSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedNFTs, setTempSelectedNFTs] = useState<NFTToken[]>(selectedNFTs);
  const [nfts, setNfts] = useState<NFTToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  const { chainId } = useWalletStore();
  const walletAddress = useWalletStore(state => state.address);

  // Determine which address to use for fetching NFTs
  const targetAddress = counterpartyAddress || walletAddress;
  const isValidTarget = targetAddress && isValidAddress(targetAddress);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isValidTarget || !chainId) {
        setNfts([]);
        setError(!targetAddress ? 'No address provided' : 'Invalid address');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchedNFTs = await retryWithBackoff(
          () => fetchAllNFTs(targetAddress, chainId),
          3,
          1000,
          { maxDelay: 5000 }
        );

        setNfts(fetchedNFTs);
        setError(null);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to load NFTs. Please try again.');
        setNfts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchNFTs();
    }
  }, [isOpen, targetAddress, chainId, isValidTarget]);

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedNFTs(selectedNFTs);
      setSearchQuery('');
      setExpandedCollections(new Set());
    }
  }, [isOpen, selectedNFTs]);

  // Group NFTs by collection
  const collectionGroups = useMemo(() => {
    const groups = new Map<string, NFTToken[]>();
    const filteredNFTs = nfts.filter(nft => {
      const searchLower = searchQuery.toLowerCase();
      return (
        nft.name.toLowerCase().includes(searchLower) ||
        nft.collection.toLowerCase().includes(searchLower)
      );
    });

    filteredNFTs.forEach(nft => {
      const collection = nft.collection || 'Unknown Collection';
      if (!groups.has(collection)) {
        groups.set(collection, []);
      }
      groups.get(collection)!.push(nft);
    });

    return Array.from(groups.entries())
      .map(([name, nfts]): CollectionGroup => ({ name, nfts }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [nfts, searchQuery]);

  const handleNFTSelect = (nft: NFTToken) => {
    if (multiSelect) {
      setTempSelectedNFTs(current => {
        const isSelected = current.some(n => n.id === nft.id);
        if (isSelected) {
          return current.filter(n => n.id !== nft.id);
        }
        return [...current, nft];
      });
    } else {
      onSelect([nft]);
      onClose();
    }
  };

  const toggleCollection = (collectionName: string) => {
    setExpandedCollections(prev => {
      const next = new Set(prev);
      if (next.has(collectionName)) {
        next.delete(collectionName);
      } else {
        next.add(collectionName);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onSelect(tempSelectedNFTs);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={counterpartyAddress ? "Select Counterparty NFTs" : "Select Your NFTs"}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or collection..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="min-h-[300px] max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : collectionGroups.length === 0 ? (
            <EmptyState 
              message={
                searchQuery 
                  ? "No NFTs match your search" 
                  : counterpartyAddress
                  ? "No NFTs found in counterparty wallet"
                  : "No NFTs found in your wallet"
              } 
            />
          ) : (
            <div className="space-y-4">
              {collectionGroups.map(({ name, nfts: collectionNFTs }) => (
                <div key={name} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCollection(name)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({collectionNFTs.length})
                      </span>
                    </div>
                    <span className="transform transition-transform duration-200">
                      {expandedCollections.has(name) ? '▼' : '▶'}
                    </span>
                  </button>
                  
                  {expandedCollections.has(name) && (
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {collectionNFTs.map(nft => {
                        const isSelected = tempSelectedNFTs.some(s => s.id === nft.id);
                        return (
                          <button
                            key={nft.id}
                            onClick={() => handleNFTSelect(nft)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 shadow-lg'
                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <img
                              src={nft.imageUrl}
                              alt={nft.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <p className="text-white text-sm truncate">{nft.name}</p>
                              {nft.standard === 'ERC1155' && nft.balance && (
                                <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                  x{nft.balance}
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 left-2 bg-blue-500 rounded-full p-1">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {multiSelect && (
          <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selected: {tempSelectedNFTs.length} NFT{tempSelectedNFTs.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleConfirm}
              disabled={tempSelectedNFTs.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Selection
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}