import React from 'react';
import { WalletInfo } from '../../types/wallet';
import { AlertCircle, CheckCircle2, Wallet } from 'lucide-react';

interface WalletStatusProps {
  walletInfo: WalletInfo;
  isChecking: boolean;
  error: string | null;
}

export default function WalletStatus({ walletInfo, isChecking, error }: WalletStatusProps) {
  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
        <span>Detecting wallet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (!walletInfo.isInstalled) {
    return (
      <div className="flex items-center space-x-2 text-yellow-500">
        <Wallet className="w-4 h-4" />
        <span>No wallet detected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-500">
      <CheckCircle2 className="w-4 h-4" />
      <span>{walletInfo.type} detected</span>
    </div>
  );
}