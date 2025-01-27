import { Contract, JsonRpcSigner } from 'ethers';
import { NFTDetails, CreateSwapParams } from './types';
import { approveNFTContract } from '../nft/approvals';
import { retryWithBackoff } from '../../utils/retry';

export class SwapOrderCreator {
  constructor(private readonly contract: Contract) {}

  async createOrder(params: CreateSwapParams, signer: JsonRpcSigner) {
    // Handle NFT approvals
    await this.approveNFTs(params.fromNFTs, signer);

    // Create and execute transaction
    const tx = await this.executeSwapTransaction(params);
    return await tx.wait();
  }

  private async approveNFTs(nfts: NFTDetails[], signer: JsonRpcSigner) {
    for (const nft of nfts) {
      await approveNFTContract(
        nft.contractAddress,
        this.contract.target,
        signer
      );
    }
  }

  private async executeSwapTransaction(params: CreateSwapParams) {
    return retryWithBackoff(
      () => this.contract.createSwapOrder(
        params.fromNFTs,
        params.toNFTs,
        params.counterpartyAddress,
        { gasLimit: 1000000 }
      ),
      3,
      1000
    );
  }
}