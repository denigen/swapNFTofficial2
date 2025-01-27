import React, { useState } from 'react';
import { useCreateSwap } from '../../hooks/useCreateSwap';
import { NFTToken } from '../../types/nft';
import { useWalletStore } from '../../stores/useWalletStore';

interface SwapFormProps {
  selectedFromNFTs: NFTToken[];
  selectedToNFTs: NFTToken[];
  onSuccess: (orderId: string) => void;
}

export default function SwapForm({ 
  selectedFromNFTs, 
  selectedToNFTs, 
  onSuccess 
}: SwapFormProps) {
  const [takerAddress, setTakerAddress] = useState('');
  const { createSwap, isCreating, error } = useCreateSwap();
  const { isConnected } = useWalletStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderId = await createSwap(
      selectedFromNFTs,
      selectedToNFTs,
      takerAddress
    );

    if (orderId) {
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Counterparty Address
        </label>
        <input
          type="text"
          value={takerAddress}
          onChange={(e) => setTakerAddress(e.target.value)}
          placeholder="0x..."
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isConnected || isCreating || !takerAddress || selectedFromNFTs.length === 0}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {isCreating ? 'Creating Swap...' : 'Create Swap'}
      </button>
    </form>
  );
}