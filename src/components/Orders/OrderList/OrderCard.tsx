import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SwapOrder } from '../../../types/order';
import { NFTList } from './NFTList';
import { OrderStatus } from './OrderStatus';
import { OrderActions } from './OrderActions';
import { formatAddress } from '../../../utils/addressUtils';
import { useWalletStore } from '../../../stores/useWalletStore';

interface OrderCardProps {
  order: SwapOrder;
  onOrderComplete?: () => void;
}

export function OrderCard({ order, onOrderComplete }: OrderCardProps) {
  const { address } = useWalletStore();
  const isTaker = address?.toLowerCase() === order.taker.toLowerCase();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isTaker ? 'Incoming Swap Request' : 'Outgoing Swap Request'}
            </h3>
            <OrderStatus status={order.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isTaker ? (
              <>From {formatAddress(order.maker)}</>
            ) : (
              <>To {formatAddress(order.taker)}</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {isTaker ? "You'll Receive" : "You'll Send"}
          </p>
          <NFTList nfts={order.makerNFTs} />
        </div>

        <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {isTaker ? "You'll Send" : "You'll Receive"}
          </p>
          <NFTList nfts={order.takerNFTs} />
        </div>
      </div>

      {order.status === 'pending' && (
        <OrderActions
          orderId={order.id}
          onComplete={onOrderComplete}
          isTaker={isTaker}
        />
      )}
    </div>
  );
}