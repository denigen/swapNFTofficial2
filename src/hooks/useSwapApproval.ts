import { useState, useCallback } from 'react';
import { NFTToken } from '../types/nft';
import { useWalletStore } from '../stores/useWalletStore';
import { checkNFTApprovals } from '../services/nft/approvals/approvalChecker';
import { getContractAddress } from '../config/contracts/addresses';

export function useSwapApproval() {
  const { address, chainId } = useWalletStore();
  const [isChecking, setIsChecking] = useState(false);
  const [needsApproval, setNeedsApproval] = useState<NFTToken[]>([]);

  const checkApprovals = useCallback(async (nfts: NFTToken[]) => {
    if (!address || !chainId) return [];

    setIsChecking(true);
    try {
      const swapContractAddress = getContractAddress(chainId, 'NFT_SWAP');
      const unapprovedNFTs = await checkNFTApprovals(
        nfts,
        address,
        swapContractAddress,
        chainId
      );
      setNeedsApproval(unapprovedNFTs);
      return unapprovedNFTs;
    } catch (error) {
      console.error('Error checking approvals:', error);
      return nfts; // Assume all need approval on error
    } finally {
      setIsChecking(false);
    }
  }, [address, chainId]);

  return {
    checkApprovals,
    isChecking,
    needsApproval
  };
}