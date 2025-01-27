import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex flex-col items-center space-y-2">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading NFTs...
        </p>
      </div>
    </div>
  );
}