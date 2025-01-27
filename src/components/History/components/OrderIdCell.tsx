import React, { useState } from 'react';
import { Copy } from 'lucide-react';

interface OrderIdCellProps {
  orderId: string;
}

export default function OrderIdCell({ orderId }: OrderIdCellProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
        {orderId.slice(0, 8)}...{orderId.slice(-6)}
      </span>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        title="Copy Order ID"
      >
        <Copy className="w-4 h-4" />
      </button>
      {copied && (
        <span className="text-xs text-green-500">Copied!</span>
      )}
    </div>
  );
}