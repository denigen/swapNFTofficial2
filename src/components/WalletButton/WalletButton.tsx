import React from 'react';
import { Wallet } from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { formatAddress } from '../../utils/addressUtils';

export default function WalletButton() {
  const { 
    isConnected, 
    address, 
    connect, 
    disconnect, 
    isConnecting,
    error 
  } = useWalletStore();

  return (
    <div>
      <button
        onClick={() => isConnected ? disconnect() : connect()}
        disabled={isConnecting}
        className={`retro-button pixel-corners flex items-center space-x-2 ${
          isConnected
            ? 'bg-accent text-bg'
            : 'bg-primary text-bg'
        } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-xs">
          {isConnecting
            ? 'Connecting...'
            : isConnected
            ? formatAddress(address!)
            : 'Connect Wallet'}
        </span>
      </button>
      {error && (
        <p className="text-secondary text-xs mt-2 font-pixel">{error}</p>
      )}
    </div>
  );
}