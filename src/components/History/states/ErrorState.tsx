import React from 'react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        <p>{error}</p>
        <button
          onClick={onRetry}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}