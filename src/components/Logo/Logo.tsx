import React from 'react';
import { Repeat } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center bg-transparent p-2 rounded-lg">
        <Repeat className="w-6 h-6 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-wider text-primary font-pixel">
          SwapNFT
        </span>
      </div>
    </div>
  );
}