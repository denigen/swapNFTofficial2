import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SwapOrder } from '../../types/order';
import { OrderActions } from './OrderActions';
import { formatAddress } from '../../utils/addressUtils';
import { formatOrderNumber } from '../../utils/orderUtils';
import { useWalletStore } from '../../stores/useWalletStore';

interface OrderCardProps {
  order: SwapOrder;
  onOrderComplete?: () => void;
}

export default function OrderCard({ order, onOrderComplete }: OrderCardProps) {
  const { address } = useWalletStore();
  const isTaker = address?.toLowerCase() === order.taker.toLowerCase();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatOrderNumber(order.id)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isTaker ? (
              <>From {formatAddress(order.maker)}</>
            ) : (
              <>To {formatAddress(order.taker)}</>
            )}
          </p>
        </div>
      </div>
      {/* Rest of the component remains the same */}
    </div>
  );
}