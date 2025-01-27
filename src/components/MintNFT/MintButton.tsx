import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import { useWalletStore } from '../../stores/useWalletStore';
import { mintTestNFT } from '../../utils/mintUtils';

export default function MintButton() {
  const { signer, chainId, isConnected } = useWalletStore();
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState<{
    success?: boolean;
    error?: string;
    txHash?: string;
  } | null>(null);

  const handleMint = async () => {
    if (!signer || !chainId) return;

    setIsMinting(true);
    setStatus(null);

    try {
      const result = await mintTestNFT(signer, chainId);
      setStatus({
        success: true,
        txHash: result.txHash
      });
    } catch (error) {
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mint NFT'
      });
    } finally {
      setIsMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
      >
        Connect Wallet to Mint
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleMint}
        disabled={isMinting}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isMinting
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isMinting ? (
          <span className="flex items-center space-x-2">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Minting...</span>
          </span>
        ) : (
          'Mint Test NFT'
        )}
      </button>

      {status && (
        <div className={`p-4 rounded-lg ${
          status.success 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }`}>
          {status.success ? (
            <div className="space-y-1">
              <p className="font-medium">NFT Minted Successfully!</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${status.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                View on Etherscan
              </a>
            </div>
          ) : (
            <p>{status.error}</p>
          )}
        </div>
      )}
    </div>
  );
}