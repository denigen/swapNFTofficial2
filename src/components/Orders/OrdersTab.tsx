import React, { useEffect } from 'react';
import { useWalletStore } from '../../stores/useWalletStore';
import { useOrderStore } from '../../stores/useOrderStore';
import OrderLookup from './OrderLookup';
import OrderHistoryList from './OrderHistory/OrderHistoryList';
import WalletRequiredState from './WalletRequiredState';
import { useOrders } from '../../hooks/useOrders';

export default function OrdersTab() {
  const { isConnected, address } = useWalletStore();
  const { orders, isLoading, error, refresh } = useOrders();
  const syncOrders = useOrderStore(state => state.syncOrders);

  // Sync orders when wallet connects or address changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('Syncing orders for address:', address);
      syncOrders(address);
    }
  }, [isConnected, address, syncOrders]);

  if (!isConnected) {
    return <WalletRequiredState />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Orders
      </h2>

      <OrderLookup />

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Orders
        </h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 dark:border-blue-400 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            <p>{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <OrderHistoryList orders={orders} />
        )}
      </div>
    </div>
  );
}