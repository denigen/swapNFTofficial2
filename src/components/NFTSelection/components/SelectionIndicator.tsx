import React from 'react';
import { Check } from 'lucide-react';

export default function SelectionIndicator() {
  return (
    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
      <Check className="w-4 h-4 text-white" />
    </div>
  );
}