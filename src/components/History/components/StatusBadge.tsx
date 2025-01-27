import React from 'react';

interface StatusBadgeProps {
  isActive: boolean;
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    }`}>
      {isActive ? 'Pending' : 'Completed'}
    </span>
  );
}