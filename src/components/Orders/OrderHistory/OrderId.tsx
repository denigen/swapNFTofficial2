import React, { useState } from 'react';
import { Copy } from 'lucide-react';

interface OrderIdProps {
  id: string;
}

export default function OrderId({ id }: OrderIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono truncate max-w-[180px]">
        {id}
      </code>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
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