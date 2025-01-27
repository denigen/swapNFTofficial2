import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  filterType?: string;
}

export function EmptyState({ filterType }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Inbox className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No {filterType ? `${filterType} ` : ''}Orders Found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
        {filterType 
          ? `You don't have any ${filterType.toLowerCase()} orders at the moment.`
          : 'When someone creates a swap with you as the counterparty, it will appear here.'}
      </p>
    </div>
  );
}