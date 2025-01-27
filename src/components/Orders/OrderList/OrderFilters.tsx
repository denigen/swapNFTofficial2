import React from 'react';
import { OrderStatus } from '../../../types/order';

interface OrderFiltersProps {
  status: OrderStatus | undefined;
  onStatusChange: (status: OrderStatus | undefined) => void;
}

export function OrderFilters({ status, onStatusChange }: OrderFiltersProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onStatusChange(undefined)}
        className={`px-4 py-2 rounded-lg transition-colors ${
          !status
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onStatusChange('pending')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          status === 'pending'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        Pending
      </button>
      <button
        onClick={() => onStatusChange('completed')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          status === 'completed'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        Completed
      </button>
    </div>
  );
}