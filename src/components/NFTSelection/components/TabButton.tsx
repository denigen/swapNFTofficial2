import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  count: number;
  label: string;
}

export default function TabButton({ isActive, onClick, count, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 -mb-px ${
        isActive
          ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {label} ({count})
    </button>
  );
}