import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useOrderExecution } from '../../hooks/useOrderExecution';
import { ExternalLink } from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { getNetworkConfig } from '../../config/networks';

export default function OrderLookup() {
  const [orderId, setOrderId] = useState('');
  const { executeOrder, isExecuting, error, txHash } = useOrderExecution();
  const { chainId } = useWalletStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      return;
    }

    try {
      await executeOrder(orderId.trim());
      setOrderId('');
    } catch (err) {
      console.error('Failed to execute order:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/10 p-6 mb-6 transition-colors">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Accept Order
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        {txHash && chainId && (
          <div className="text-sm text-green-500 dark:text-green-400 flex items-center justify-center gap-2">
            <span>Transaction submitted!</span>
            <a
              href={`${getNetworkConfig(chainId)?.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>View</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isExecuting || !orderId.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExecuting ? 'Processing...' : 'Accept Order'}
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Enter the order ID provided by the counterparty to review and accept the swap.
        </p>
      </form>
    </div>
  );
}