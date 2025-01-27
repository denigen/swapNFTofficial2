import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { SwapService } from '../services/contracts/SwapService';
import { NFTToken } from '../types/nft';
import { useOrderStore } from '../stores/useOrderStore';

interface SwapParams {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
  counterpartyAddress: string;
}

interface SwapResult {
  success: boolean;
  txHash?: string;
  orderId?: string;
  error?: string;
}

export function useSwap() {
  const { chainId, signer } = useWalletStore();
  const addOrder = useOrderStore(state => state.addOrder);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSwap = async (params: SwapParams): Promise<SwapResult> => {
    if (!signer || !chainId) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsCreating(true);
    setError(null);

    try {
      const swapService = new SwapService(chainId, signer);
      await swapService.initialize();
      
      const result = await swapService.createSwapOrder(params);
      
      // Add order to local store
      addOrder({
        id: result.orderId,
        maker: await signer.getAddress(),
        taker: params.counterpartyAddress,
        makerNFTs: params.fromNFTs,
        takerNFTs: params.toNFTs,
        createdAt: Date.now(),
        status: 'pending',
        isActive: true,
        chainId
      });

      return {
        success: true,
        txHash: result.txHash,
        orderId: result.orderId
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create swap';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createSwap,
    isCreating,
    error
  };
}