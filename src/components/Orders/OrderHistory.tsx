import React from 'react';
import { useWalletOrders } from '../../hooks/useWalletOrders';
import { formatDate } from '../../utils/dateUtils';
import { formatAddress } from '../../utils/addressUtils';
import { ExternalLink } from 'lucide-react';
import { getNetworkConfig } from '../../config/networks';

export default function OrderHistory() {
  const { orders, isLoading, error } = useWalletOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : order.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
            {order.txHash && (
              <a
                href={`${getNetworkConfig(8453)?.blockExplorer}/tx/${order.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
              >
                <span className="text-sm">View</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">From</p>
              <p className="text-sm">{formatAddress(order.maker)}</p>
              <div className="mt-2 space-y-2">
                {order.makerNFTs.map(nft => (
                  <div key={nft.id} className="flex items-center space-x-2">
                    <img src={nft.imageUrl} alt={nft.name} className="w-8 h-8 rounded" />
                    <div>
                      <p className="text-sm font-medium">{nft.name}</p>
                      <p className="text-xs text-gray-500">{nft.collection}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">To</p>
              <p className="text-sm">{formatAddress(order.taker)}</p>
              <div className="mt-2 space-y-2">
                {order.takerNFTs.map(nft => (
                  <div key={nft.id} className="flex items-center space-x-2">
                    <img src={nft.imageUrl} alt={nft.name} className="w-8 h-8 rounded" />
                    <div>
                      <p className="text-sm font-medium">{nft.name}</p>
                      <p className="text-xs text-gray-500">{nft.collection}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}