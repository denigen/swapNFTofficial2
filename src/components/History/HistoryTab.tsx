import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useWalletStore } from '../../stores/useWalletStore';
import HistoryTable from './components/HistoryTable';
import LoadingState from './states/LoadingState';
import ErrorState from './states/ErrorState';

export default function HistoryTab() {
  const { orders, isLoading, error, refresh } = useOrders();
  const { chainId } = useWalletStore();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Order History
          </h2>
        </div>
        <HistoryTable orders={orders} />
      </div>
    </div>
  );
}