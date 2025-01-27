import React, { useState } from 'react';
import { ArrowDownUp, Settings2, Wallet } from 'lucide-react';

interface NFTToken {
  id: string;
  name: string;
  collection: string;
  imageUrl: string;
}

export default function SwapCard() {
  const [fromNFT, setFromNFT] = useState<NFTToken | null>(null);
  const [toNFT, setToNFT] = useState<NFTToken | null>(null);

  const handleSwap = () => {
    // Implement swap logic here
    console.log('Swap initiated');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Swap NFTs</h2>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* From NFT Selection */}
      <div className="bg-gray-50 p-4 rounded-xl mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">From</span>
          <span className="text-sm text-gray-500">Balance: 0</span>
        </div>
        <button 
          className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors"
          onClick={() => {/* Implement NFT selection */}}
        >
          {fromNFT ? (
            <div className="flex items-center space-x-3">
              <img src={fromNFT.imageUrl} alt={fromNFT.name} className="w-12 h-12 rounded-lg" />
              <div className="text-left">
                <p className="font-medium">{fromNFT.name}</p>
                <p className="text-sm text-gray-500">{fromNFT.collection}</p>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Select NFT</span>
          )}
        </button>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-3 z-10 relative">
        <button 
          className="bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          onClick={() => {
            const temp = fromNFT;
            setFromNFT(toNFT);
            setToNFT(temp);
          }}
        >
          <ArrowDownUp className="w-5 h-5 text-blue-500" />
        </button>
      </div>

      {/* To NFT Selection */}
      <div className="bg-gray-50 p-4 rounded-xl mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">To</span>
          <span className="text-sm text-gray-500">Balance: 0</span>
        </div>
        <button 
          className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors"
          onClick={() => {/* Implement NFT selection */}}
        >
          {toNFT ? (
            <div className="flex items-center space-x-3">
              <img src={toNFT.imageUrl} alt={toNFT.name} className="w-12 h-12 rounded-lg" />
              <div className="text-left">
                <p className="font-medium">{toNFT.name}</p>
                <p className="text-sm text-gray-500">{toNFT.collection}</p>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Select NFT</span>
          )}
        </button>
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl mt-6 transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}