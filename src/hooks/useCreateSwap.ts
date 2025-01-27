import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { swapService } from '../services/contracts/swapService';
import { NFTToken } from '../types/nft';

export function useCreateSwap() {
  const { signer } = useWalletStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSwap = async (
    fromNFTs: NFTToken[],
    toNFTs: NFTToken[],
    takerAddress: string
  ) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const makerNFTs = fromNFTs.map(nft => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId
      }));

      const takerNFTs = toNFTs.map(nft => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId
      }));

      const receipt = await swapService.createSwapOrder(
        makerNFTs,
        takerNFTs,
        takerAddress,
        signer
      );

      // Get the order ID from the event logs
      const event = receipt.logs.find(
        log => log.eventName === 'SwapOrderCreated'
      );

      return event?.args?.orderId || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create swap');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createSwap, isCreating, error };
}