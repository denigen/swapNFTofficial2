import React from 'react';
import { Loader } from 'lucide-react';

export default function OrdersLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <div className="absolute inset-0 animate-pulse opacity-50" />
      </div>
      <p className="mt-4 text-gray-500 dark:text-gray-400">
        Loading your orders...
      </p>
    </div>
  );
}