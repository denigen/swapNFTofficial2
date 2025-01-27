import { Contract, JsonRpcSigner } from 'ethers';
import { NFT_SWAP_ABI } from '../../config/contracts/abis/nftSwap';
import { SwapParams, SwapResult } from './types';
import { checkApproval, setApproval } from './approval';
import { BASE_CONFIG } from '../../config/chains/base';

export class SwapService {
  private contract: Contract | null = null;

  constructor(private signer: JsonRpcSigner) {}

  async initialize(): Promise<void> {
    this.contract = new Contract(
      BASE_CONFIG.contracts.NFT_SWAP,
      NFT_SWAP_ABI,
      this.signer
    );
  }

  async createSwap(params: SwapParams): Promise<SwapResult> {
    if (!this.contract) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      // Handle approvals
      for (const nft of params.fromNFTs) {
        const ownerAddress = await this.signer.getAddress();
        const isApproved = await checkApproval(
          nft.contractAddress,
          ownerAddress,
          this.contract.target,
          this.signer
        );

        if (!isApproved) {
          const approvalResult = await setApproval(
            nft.contractAddress,
            this.contract.target,
            this.signer
          );

          if (!approvalResult.success) {
            return { 
              success: false, 
              error: `Approval failed for NFT ${nft.name}: ${approvalResult.error}` 
            };
          }
        }
      }

      // Format NFT details
      const makerNFTs = params.fromNFTs.map(nft => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId
      }));

      const takerNFTs = params.toNFTs.map(nft => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId
      }));

      // Create swap
      const tx = await this.contract.createSwapOrder(
        makerNFTs,
        takerNFTs,
        params.counterpartyAddress,
        { gasLimit: 1000000 }
      );

      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating swap'
      };
    }
  }
}