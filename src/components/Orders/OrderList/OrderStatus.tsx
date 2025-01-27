import React from 'react';
import { OrderStatus as StatusType } from '../../../types/order';

interface OrderStatusProps {
  status: StatusType;
}

export function OrderStatus({ status }: OrderStatusProps) {
  const statusConfig = {
    pending: {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      label: 'Pending'
    },
    completed: {
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      label: 'Completed'
    },
    cancelled: {
      className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      label: 'Cancelled'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}