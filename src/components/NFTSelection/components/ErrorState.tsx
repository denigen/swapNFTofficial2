import React from 'react';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500 dark:text-red-400">{message}</p>
    </div>
  );
}