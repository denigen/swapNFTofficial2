import React from 'react';
import { Inbox } from 'lucide-react';

export default function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Inbox className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        No Pending Orders
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
        You don't have any pending swap requests. When someone creates a swap with you as the counterparty, it will appear here.
      </p>
    </div>
  );
}