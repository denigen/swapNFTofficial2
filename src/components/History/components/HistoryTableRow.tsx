import React from 'react';
import { SwapOrder } from '../../../types/order';
import { formatDate } from '../../../utils/dateUtils';
import { formatAddress } from '../../../utils/addressUtils';
import OrderIdCell from './OrderIdCell';
import StatusBadge from './StatusBadge';

interface HistoryTableRowProps {
  order: SwapOrder;
}

export default function HistoryTableRow({ order }: HistoryTableRowProps) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <OrderIdCell orderId={order.id} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(order.createdAt)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {formatAddress(order.maker)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {formatAddress(order.taker)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge isActive={order.isActive} />
      </td>
    </tr>
  );
}