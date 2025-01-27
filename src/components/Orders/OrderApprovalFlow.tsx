import React, { useState } from 'react';
import { Check, AlertCircle, Loader } from 'lucide-react';
import { NFTToken } from '../../types/nft';
import { approveNFTContract } from '../../services/nft/approvals/approvalManager';
import { useWalletStore } from '../../stores/useWalletStore';

interface OrderApprovalFlowProps {
  nfts: NFTToken[];
  swapContractAddress: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface ApprovalStatus {
  [nftId: string]: {
    approved: boolean;
    loading: boolean;
    error?: string;
  };
}

export default function OrderApprovalFlow({ 
  nfts,
  swapContractAddress,
  onComplete,
  onCancel 
}: OrderApprovalFlowProps) {
  const { signer } = useWalletStore();
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({});
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApproval = async () => {
    if (!signer) return;
    
    setIsApproving(true);
    setError(null);

    for (const nft of nfts) {
      // Skip if already approved
      if (approvalStatus[nft.id]?.approved) continue;

      // Update status to loading
      setApprovalStatus(prev => ({
        ...prev,
        [nft.id]: { approved: false, loading: true }
      }));

      try {
        const result = await approveNFTContract(
          nft.contractAddress,
          swapContractAddress,
          signer
        );

        if (result.cancelled) {
          // User cancelled - stop the approval process
          setApprovalStatus(prev => ({
            ...prev,
            [nft.id]: { approved: false, loading: false }
          }));
          setIsApproving(false);
          return;
        }

        if (!result.success) {
          throw new Error(result.error || 'Approval failed');
        }

        // Update status to approved
        setApprovalStatus(prev => ({
          ...prev,
          [nft.id]: { approved: true, loading: false }
        }));
      } catch (error) {
        console.error(`Failed to approve NFT ${nft.id}:`, error);
        setApprovalStatus(prev => ({
          ...prev,
          [nft.id]: { 
            approved: false, 
            loading: false,
            error: error instanceof Error ? error.message : 'Approval failed'
          }
        }));
        setError(`Failed to approve ${nft.name}`);
        setIsApproving(false);
        return;
      }
    }

    // Check if all NFTs are approved
    const allApproved = nfts.every(nft => approvalStatus[nft.id]?.approved);
    if (allApproved) {
      onComplete();
    }

    setIsApproving(false);
  };

  const allApproved = nfts.every(nft => approvalStatus[nft.id]?.approved);
  const hasErrors = nfts.some(nft => approvalStatus[nft.id]?.error);

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl">
        <div className="flex items-start space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
              NFT Approval Required
            </h3>
            <p className="text-yellow-700 dark:text-yellow-400 mt-1">
              Before accepting this swap, you must approve the following NFTs for trading.
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {nfts.map(nft => {
            const status = approvalStatus[nft.id];
            return (
              <div 
                key={nft.id}
                className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border ${
                  status?.error 
                    ? 'border-red-200 dark:border-red-900'
                    : status?.approved
                    ? 'border-green-200 dark:border-green-900'
                    : 'border-yellow-200 dark:border-yellow-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{nft.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{nft.collection}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {status?.approved ? (
                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                  ) : status?.loading ? (
                    <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Approving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Needs Approval</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          disabled={isApproving}
          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleApproval}
          disabled={isApproving || allApproved || hasErrors}
          className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApproving ? 'Approving NFTs...' : 
           allApproved ? 'NFTs Approved' : 
           hasErrors ? 'Approval Failed' :
           'Approve NFTs'}
        </button>
      </div>
    </div>
  );
}