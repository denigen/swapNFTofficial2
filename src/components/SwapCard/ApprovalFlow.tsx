import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { NFTToken } from '../../types/nft';
import { useWalletStore } from '../../stores/useWalletStore';
import { approveNFTContract } from '../../services/nft/approvals';

interface ApprovalFlowProps {
  nfts: NFTToken[];
  swapContractAddress: string;
  onComplete: () => void;
}

export default function ApprovalFlow({ nfts, swapContractAddress, onComplete }: ApprovalFlowProps) {
  const { signer } = useWalletStore();
  const [approving, setApproving] = React.useState(false);
  const [currentNFT, setCurrentNFT] = React.useState<NFTToken | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleApproval = async () => {
    if (!signer || !nfts.length) return;
    
    setApproving(true);
    setError(null);

    try {
      for (const nft of nfts) {
        setCurrentNFT(nft);
        await approveNFTContract(nft.contractAddress, swapContractAddress, signer);
      }
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve NFTs');
    } finally {
      setApproving(false);
      setCurrentNFT(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="text-yellow-800 dark:text-yellow-300 font-medium mb-2">
          Approval Required
        </h3>
        <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-4">
          To complete this swap, you need to approve the following NFTs:
        </p>
        <ul className="space-y-2">
          {nfts.map(nft => (
            <li 
              key={nft.id}
              className={`flex items-center justify-between p-2 rounded-lg ${
                currentNFT?.id === nft.id 
                  ? 'bg-yellow-100 dark:bg-yellow-800/30' 
                  : 'bg-white/50 dark:bg-gray-800/30'
              }`}
            >
              <span className="text-sm">{nft.name}</span>
              {currentNFT?.id === nft.id && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                  Approving...
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-500 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleApproval}
        disabled={approving}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {approving ? 'Approving...' : 'Approve NFTs'}
      </button>
    </div>
  );
}