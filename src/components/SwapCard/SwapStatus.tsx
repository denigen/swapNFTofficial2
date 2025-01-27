import React from 'react';
import { CheckCircle, XCircle, Copy, X } from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { getNetworkConfig } from '../../config/networks';
import { shortenOrderId } from '../../utils/orderUtils';

interface SwapStatusProps {
  error?: string;
  txHash?: string;
  orderId?: string;
  onClose: () => void;
}

export default function SwapStatus({ error, txHash, orderId, onClose }: SwapStatusProps) {
  const { chainId } = useWalletStore();
  const [copied, setCopied] = React.useState(false);
  
  if (!error && !txHash) return null;

  const networkConfig = chainId ? getNetworkConfig(chainId) : null;
  const explorerUrl = networkConfig?.blockExplorer;
  const txUrl = explorerUrl && txHash ? `${explorerUrl}/tx/${txHash}` : null;

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`mt-4 p-4 rounded-lg relative ${
      error ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
    }`}>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start space-x-3">
        {error ? (
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
        )}
        
        <div>
          <h4 className={`font-medium ${
            error ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
          }`}>
            {error ? 'Swap Failed' : 'Swap Created Successfully'}
          </h4>
          
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          ) : (
            <div className="mt-2 space-y-2">
              {orderId && (
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Order ID:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-green-100 dark:bg-green-900/40 rounded text-sm font-mono">
                      {shortenOrderId(orderId)}
                    </code>
                    <button
                      onClick={handleCopyOrderId}
                      className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
                      title="Copy Order ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Copied!
                    </span>
                  )}
                </div>
              )}
              {txHash && txUrl && (
                <div>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Transaction Hash:
                  </p>
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-600 break-all"
                  >
                    {txHash}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}