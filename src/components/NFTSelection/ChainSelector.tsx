import React from 'react';
import { Chain } from '../../types/chain';

interface ChainSelectorProps {
  chains: Chain[];
  selectedChain: Chain;
  onSelectChain: (chain: Chain) => void;
}

export default function ChainSelector({ chains, selectedChain, onSelectChain }: ChainSelectorProps) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => onSelectChain(chain)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedChain.id === chain.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <img src={chain.icon} alt={chain.name} className="w-5 h-5" />
          <span>{chain.name}</span>
        </button>
      ))}
    </div>
  );
}