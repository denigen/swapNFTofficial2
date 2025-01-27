import React, { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import NFTSelection from './NFTSelection';
import SwapButton from './SwapButton';
import SwapStatus from './SwapStatus';
import ApprovalFlow from './ApprovalFlow';
import ConfirmationDialog from './ConfirmationDialog';
import NetworkSelector from '../NetworkSelector/NetworkSelector';
import NFTSelectionModal from '../NFTSelection/NFTSelectionModal';
import { NFTToken } from '../../types/nft';
import { useWalletStore } from '../../stores/useWalletStore';
import { useSwap } from '../../hooks/useSwap';
import { useSwapApproval } from '../../hooks/useSwapApproval';
import { isValidAddress } from '../../utils/addressUtils';
import { chains } from '../../config/chains';
import { getContractAddress } from '../../config/contracts/addresses';

type SwapStep = 'input' | 'approval' | 'confirmation';

export default function SwapCard() {
  const [fromNFTs, setFromNFTs] = useState<NFTToken[]>([]);
  const [toNFTs, setToNFTs] = useState<NFTToken[]>([]);
  const [isSelectingFrom, setIsSelectingFrom] = useState(false);
  const [isSelectingTo, setIsSelectingTo] = useState(false);
  const [counterpartyAddress, setCounterpartyAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [currentStep, setCurrentStep] = useState<SwapStep>('input');
  const [swapStatus, setSwapStatus] = useState<{
    error?: string;
    txHash?: string;
    orderId?: string;
  } | null>(null);

  const { isConnected, chainId } = useWalletStore();
  const { createSwap, isCreating } = useSwap();
  const { checkApprovals, isChecking, needsApproval } = useSwapApproval();

  const handleCounterpartyAddressChange = (address: string) => {
    setCounterpartyAddress(address);
    setToNFTs([]);
  };

  const handleCreateSwap = async () => {
    if (!chainId) return;
    
    // Check approvals for both sides
    const swapContractAddress = getContractAddress(chainId, 'NFT_SWAP');
    const unapprovedNFTs = await checkApprovals(fromNFTs);
    
    if (unapprovedNFTs.length > 0) {
      setCurrentStep('approval');
      return;
    }

    setCurrentStep('confirmation');
  };

  const handleApprovalComplete = () => {
    setCurrentStep('confirmation');
  };

  const handleConfirmSwap = async () => {
    const result = await createSwap({
      fromNFTs,
      toNFTs,
      counterpartyAddress
    });

    setSwapStatus(result);
    setCurrentStep('input');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'approval':
        return (
          <ApprovalFlow
            nfts={needsApproval}
            swapContractAddress={getContractAddress(chainId!, 'NFT_SWAP')}
            onComplete={handleApprovalComplete}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationDialog
            fromNFTs={fromNFTs}
            toNFTs={toNFTs}
            onConfirm={handleConfirmSwap}
            onCancel={() => setCurrentStep('input')}
            isConfirming={isCreating}
          />
        );
      default:
        return (
          <button
            onClick={handleCreateSwap}
            disabled={!isConnected || fromNFTs.length === 0 || !isValidAddress(counterpartyAddress) || isCreating || isChecking}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl mt-6 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            {!isConnected 
              ? 'Connect Wallet'
              : !isValidAddress(counterpartyAddress)
              ? 'Enter Valid Counterparty Address'
              : fromNFTs.length === 0
              ? 'Select NFTs to Swap'
              : isChecking
              ? 'Checking Approvals...'
              : isCreating
              ? 'Creating Swap...'
              : 'Create OTC Swap Order'}
          </button>
        );
    }
  };

  return (
    <>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Swapper</h2>
        </div>

        <NetworkSelector
          selectedChain={selectedChain}
          onSelectChain={setSelectedChain}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Counterparty Wallet Address
          </label>
          <input
            type="text"
            value={counterpartyAddress}
            onChange={(e) => handleCounterpartyAddressChange(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <NFTSelection 
          label="You Send"
          nfts={fromNFTs}
          onClick={() => setIsSelectingFrom(true)}
        />

        <SwapButton 
          onClick={() => {
            const temp = fromNFTs;
            setFromNFTs(toNFTs);
            setToNFTs(temp);
          }} 
        />

        <NFTSelection 
          label="You Receive"
          nfts={toNFTs}
          onClick={() => setIsSelectingTo(true)}
        />

        {renderCurrentStep()}

        {swapStatus && (
          <SwapStatus
            error={swapStatus.error}
            txHash={swapStatus.txHash}
            orderId={swapStatus.orderId}
            onClose={() => setSwapStatus(null)}
          />
        )}
      </div>

      <NFTSelectionModal
        isOpen={isSelectingFrom}
        onClose={() => setIsSelectingFrom(false)}
        onSelect={(nfts) => {
          setFromNFTs(nfts);
          setIsSelectingFrom(false);
        }}
        selectedNFTs={fromNFTs}
        multiSelect={true}
      />

      <NFTSelectionModal
        isOpen={isSelectingTo}
        onClose={() => setIsSelectingTo(false)}
        onSelect={(nfts) => {
          setToNFTs(nfts);
          setIsSelectingTo(false);
        }}
        selectedNFTs={toNFTs}
        multiSelect={true}
        counterpartyAddress={counterpartyAddress}
      />
    </>
  );
}