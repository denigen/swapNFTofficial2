import React from 'react';
import { ArrowDownUp } from 'lucide-react';

interface SwapButtonProps {
  onClick: () => void;
}

export default function SwapButton({ onClick }: SwapButtonProps) {
  return (
    <div className="flex justify-center -my-3 z-10 relative">
      <button 
        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
        onClick={onClick}
      >
        <ArrowDownUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
      </button>
    </div>
  );
}