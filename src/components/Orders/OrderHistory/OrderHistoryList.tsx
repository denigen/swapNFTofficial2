import React from 'react';
import { formatDate } from '../../../utils/dateUtils';
import { formatAddress } from '../../../utils/addressUtils';
import { SwapOrder } from '../../../types/order';
import OrderId from './OrderId';
import OrderStatus from './OrderStatus';

interface OrderHistoryListProps {
  orders: SwapOrder[];
}

export default function OrderHistoryList({ orders }: OrderHistoryListProps) {
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No order history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedOrders.map((order) => (
        <div
          key={order.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/10 p-4 sm:p-6 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <OrderId id={order.id} />
                <OrderStatus status={order.status} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
              <p className="flex items-center justify-between sm:justify-end gap-2">
                <span className="sm:hidden">From:</span>
                <span className="font-mono">{formatAddress(order.maker)}</span>
              </p>
              <p className="flex items-center justify-between sm:justify-end gap-2">
                <span className="sm:hidden">To:</span>
                <span className="font-mono">{formatAddress(order.taker)}</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Offered NFTs</h4>
              <div className="space-y-2">
                {order.makerNFTs.map((nft) => (
                  <div key={nft.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <img src={nft.imageUrl} alt={nft.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{nft.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{nft.collection}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Requested NFTs</h4>
              <div className="space-y-2">
                {order.takerNFTs.map((nft) => (
                  <div key={nft.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <img src={nft.imageUrl} alt={nft.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{nft.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{nft.collection}</p>
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