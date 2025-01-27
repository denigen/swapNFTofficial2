import React from 'react';

interface OrderStatusProps {
  status: 'pending' | 'completed' | 'cancelled';
}

export default function OrderStatus({ status }: OrderStatusProps) {
  const statusStyles = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}