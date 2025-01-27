import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface OrdersErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function OrdersErrorState({ error, onRetry }: OrdersErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
              Failed to Load Orders
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center space-x-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}