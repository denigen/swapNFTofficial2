import { useState, useCallback } from 'react';
import { NFTToken } from '../types/nft';
import { useWalletStore } from '../stores/useWalletStore';
import { checkOrderApprovals } from '../services/nft/approvals/orderApprovalChecker';
import { executeApprovals } from '../services/nft/approvals/approvalExecutor';
import { retryWithBackoff } from '../utils/retry';

interface ApprovalStatus {
  [nftId: string]: {
    approved: boolean;
    loading: boolean;
    error?: string;
  };
}

export function useOrderApproval() {
  const { address, chainId, signer } = useWalletStore();
  const [isApproving, setIsApproving] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({});

  const checkApprovals = useCallback(async (nfts: NFTToken[], swapContractAddress: string) => {
    if (!address || !chainId) {
      throw new Error('Wallet not connected');
    }

    setIsChecking(true);
    try {
      const unapprovedNFTs = await retryWithBackoff(
        () => checkOrderApprovals(nfts, address, swapContractAddress, chainId),
        3,
        1000
      );

      // Update approval status for all NFTs
      const newStatus: ApprovalStatus = {};
      nfts.forEach(nft => {
        newStatus[nft.id] = {
          approved: !unapprovedNFTs.some(u => u.id === nft.id),
          loading: false
        };
      });
      setApprovalStatus(newStatus);

      return unapprovedNFTs;
    } finally {
      setIsChecking(false);
    }
  }, [address, chainId]);

  const approveNFTs = useCallback(async (nfts: NFTToken[], swapContractAddress: string) => {
    if (!signer || !chainId) {
      throw new Error('Wallet not connected');
    }

    setIsApproving(true);
    try {
      for (const nft of nfts) {
        if (!approvalStatus[nft.id]?.approved) {
          // Update status to loading
          setApprovalStatus(prev => ({
            ...prev,
            [nft.id]: { approved: false, loading: true }
          }));

          try {
            await retryWithBackoff(
              () => executeApprovals([nft], swapContractAddress, signer),
              3,
              1000
            );

            // Update status to approved
            setApprovalStatus(prev => ({
              ...prev,
              [nft.id]: { approved: true, loading: false }
            }));
          } catch (error) {
            // Update status with error
            setApprovalStatus(prev => ({
              ...prev,
              [nft.id]: { 
                approved: false, 
                loading: false,
                error: error instanceof Error ? error.message : 'Approval failed'
              }
            }));
            throw error;
          }
        }
      }
    } finally {
      setIsApproving(false);
    }
  }, [signer, chainId, approvalStatus]);

  const resetApprovalStatus = useCallback(() => {
    setApprovalStatus({});
  }, []);

  return {
    checkApprovals,
    approveNFTs,
    isApproving,
    isChecking,
    approvalStatus,
    resetApprovalStatus
  };
}