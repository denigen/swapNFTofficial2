import React from 'react';
import { usePendingOrders } from '../../services/orders/hooks/usePendingOrders';
import { formatDate } from '../../utils/dateUtils';
import { formatAddress } from '../../utils/addressUtils';
import { Loader, AlertCircle } from 'lucide-react';

export default function PendingOrdersList() {
  const { orders, error, isLoading } = usePendingOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No pending orders found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div 
          key={order.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Order #{order.id.slice(0, 8)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-sm rounded-full">
              Pending
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                From
              </p>
              <div className="space-y-2">
                {order.makerNFTs.map(nft => (
                  <div 
                    key={nft.id}
                    className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg"
                  >
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">{nft.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {nft.collection}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                To
              </p>
              <div className="space-y-2">
                {order.takerNFTs.map(nft => (
                  <div 
                    key={nft.id}
                    className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg"
                  >
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">{nft.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {nft.collection}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Maker: {formatAddress(order.maker)}</span>
              <span>Taker: {formatAddress(order.taker)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}