import React from 'react';
import { useOrderExecution } from '../../../hooks/useOrderExecution';

interface OrderActionsProps {
  orderId: string;
  onComplete?: () => void;
  isTaker: boolean;
}

export function OrderActions({ orderId, onComplete, isTaker }: OrderActionsProps) {
  const { executeOrder, isExecuting, error } = useOrderExecution();

  const handleAccept = async () => {
    try {
      await executeOrder(orderId);
      onComplete?.();
    } catch (err) {
      console.error('Failed to execute order:', err);
    }
  };

  if (!isTaker) return null;

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      <button
        onClick={handleAccept}
        disabled={isExecuting}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExecuting ? 'Accepting...' : 'Accept Swap'}
      </button>
    </div>
  );
}