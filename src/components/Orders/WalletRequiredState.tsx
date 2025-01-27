import React from 'react';
import { Wallet } from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';

export default function WalletRequiredState() {
  const { connect } = useWalletStore();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Wallet className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        Connect Your Wallet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
        Please connect your wallet to view your pending swap orders and manage your trades.
      </p>
      <button
        onClick={connect}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}