import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ContractInputProps {
  onSubmit: (address: string) => void;
}

export default function ContractInput({ onSubmit }: ContractInputProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
      onSubmit(address);
      setAddress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Paste NFT contract address (0x...)"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      {address && !address.match(/^0x[a-fA-F0-9]{40}$/) && (
        <p className="mt-1 text-sm text-red-500">
          Please enter a valid Ethereum contract address
        </p>
      )}
    </form>
  );
}