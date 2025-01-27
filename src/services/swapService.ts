import { JsonRpcSigner, Contract } from 'ethers';
import { NFTToken } from '../types/nft';
import { SWAP_CONTRACT_ADDRESSES } from '../config/contracts/addresses';
import { SWAP_ABI } from '../config/contracts/abis';
import { approveNFTContract } from './nft/approvalService';
import { retryWithBackoff } from '../utils/retry';

interface SwapParams {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
  counterpartyAddress: string;
}

interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export async function executeOTCSwap(
  signer: JsonRpcSigner,
  params: SwapParams
): Promise<SwapResult> {
  try {
    const network = await signer.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const swapContractAddress = SWAP_CONTRACT_ADDRESSES[chainId];
    if (!swapContractAddress) {
      throw new Error('Swap contract not deployed on current network');
    }

    // Approve NFTs first
    for (const nft of params.fromNFTs) {
      const approvalResult = await approveNFTContract(
        nft.contractAddress,
        swapContractAddress,
        signer
      );

      if (!approvalResult.success) {
        throw new Error(`Failed to approve NFT: ${approvalResult.error}`);
      }
    }

    // Create swap contract instance
    const swapContract = new Contract(swapContractAddress, SWAP_ABI, signer);

    // Format NFT details
    const makerNFTs = params.fromNFTs.map(nft => ({
      contractAddress: nft.contractAddress,
      tokenId: BigInt(nft.tokenId)
    }));

    const takerNFTs = params.toNFTs.map(nft => ({
      contractAddress: nft.contractAddress,
      tokenId: BigInt(nft.tokenId)
    }));

    // Create swap order with retry
    console.log('Creating swap order:', {
      makerNFTs,
      takerNFTs,
      counterparty: params.counterpartyAddress
    });

    const tx = await retryWithBackoff(
      () => swapContract.createSwapOrder(
        makerNFTs,
        takerNFTs,
        params.counterpartyAddress,
        { 
          gasLimit: 1000000,
          maxFeePerGas: undefined,
          maxPriorityFeePerGas: undefined
        }
      ),
      3,
      1000
    );

    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Swap creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}