import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { ChainConfig } from '../../config/chains/types';
import { useWalletStore } from '../../stores/useWalletStore';
import { switchChain } from '../../utils/chainUtils';
import { chains } from '../../config/networks/chains';

interface NetworkSelectorProps {
  selectedChain: ChainConfig;
  onSelectChain: (chain: ChainConfig) => void;
}

export default function NetworkSelector({ selectedChain, onSelectChain }: NetworkSelectorProps) {
  const { isConnected, chainId } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chainId) {
      const chain = chains.find(c => c.id === chainId);
      if (chain && chain.id !== selectedChain.id) {
        onSelectChain(chain);
      }
    }
  }, [chainId, selectedChain.id, onSelectChain]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChainSelect = async (chain: ChainConfig) => {
    if (isConnected) {
      try {
        await switchChain(chain);
      } catch (error) {
        console.error('Failed to switch chain:', error);
        return;
      }
    }
    onSelectChain(chain);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <img 
            src={selectedChain.icon} 
            alt={selectedChain.name} 
            className="w-5 h-5 rounded-full"
          />
          <span>{selectedChain.name} ({selectedChain.symbol})</span>
          {isConnected && chainId === selectedChain.id && (
            <span className="text-xs text-green-500 dark:text-green-400">(Connected)</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => handleChainSelect(chain)}
              className={`w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                selectedChain.id === chain.id ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <img 
                src={chain.icon} 
                alt={chain.name} 
                className="w-5 h-5 rounded-full"
              />
              <span>{chain.name} ({chain.symbol})</span>
              {isConnected && chainId === chain.id && (
                <span className="text-xs text-green-500 dark:text-green-400 ml-auto">(Connected)</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}