import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useOrderExecution } from '../../hooks/useOrderExecution';
import { useOrderApproval } from '../../hooks/useOrderApproval';
import { getNetworkConfig } from '../../config/networks';
import { useWalletStore } from '../../stores/useWalletStore';
import { useOrderStore } from '../../stores/useOrderStore';
import OrderApprovalFlow from './OrderApprovalFlow';
import { getContractAddress } from '../../config/contracts/addresses';

interface OrderActionsProps {
  orderId: string;
  onComplete?: () => void;
  isTaker: boolean;
}

type ActionStep = 'initial' | 'approval' | 'executing';

export function OrderActions({ orderId, onComplete, isTaker }: OrderActionsProps) {
  const { executeOrder, isExecuting, error, txHash } = useOrderExecution();
  const { checkApprovals } = useOrderApproval();
  const { chainId } = useWalletStore();
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
  const [currentStep, setCurrentStep] = useState<ActionStep>('initial');
  const [unapprovedNFTs, setUnapprovedNFTs] = useState<NFTToken[]>([]);

  const handleAccept = async () => {
    if (!chainId) return;

    const order = useOrderStore.getState().orders.find(o => o.id === orderId);
    if (!order) return;

    // Check approvals first
    const needsApproval = await checkApprovals(order.takerNFTs, getContractAddress(chainId, 'NFT_SWAP'));
    if (needsApproval.length > 0) {
      setUnapprovedNFTs(needsApproval);
      setCurrentStep('approval');
      return;
    }

    await executeSwap();
  };

  const executeSwap = async () => {
    setCurrentStep('executing');
    try {
      await executeOrder(orderId);
      updateOrderStatus(orderId, 'completed');
      onComplete?.();
    } catch (err) {
      console.error('Failed to execute order:', err);
      setCurrentStep('initial');
    }
  };

  if (!isTaker) return null;

  if (currentStep === 'approval') {
    return (
      <OrderApprovalFlow
        nfts={unapprovedNFTs}
        swapContractAddress={getContractAddress(chainId!, 'NFT_SWAP')}
        onComplete={() => executeSwap()}
        onCancel={() => setCurrentStep('initial')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {txHash && chainId && (
        <div className="text-sm text-green-500 dark:text-green-400 flex items-center gap-2">
          <span>Transaction submitted!</span>
          <a
            href={`${getNetworkConfig(chainId)?.blockExplorer}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600"
          >
            <span>View</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      <button
        onClick={handleAccept}
        disabled={isExecuting}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExecuting ? 'Processing...' : 'Accept Swap'}
      </button>
    </div>
  );
}