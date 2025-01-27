import { Contract, JsonRpcSigner } from 'ethers';
import { getContractAddress } from '../../config/contracts/addresses';
import { NFT_SWAP_ABI } from '../../config/contracts/abis/nftSwap';
import { NFTToken } from '../../types/nft';
import { approveNFTContract } from '../nft/approvals';

interface SwapParams {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
  counterpartyAddress: string;
}

export class NFTSwapService {
  private contract: Contract | null = null;
  private chainId: number;
  private signer: JsonRpcSigner;

  constructor(chainId: number, signer: JsonRpcSigner) {
    this.chainId = chainId;
    this.signer = signer;
  }

  async initialize() {
    const address = getContractAddress(this.chainId, 'NFT_SWAP');
    this.contract = new Contract(address, NFT_SWAP_ABI, this.signer);
  }

  async createSwapOrder(params: SwapParams) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    // Approve NFTs first
    for (const nft of params.fromNFTs) {
      await approveNFTContract(
        nft.contractAddress,
        this.contract.target,
        this.signer
      );
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

    // Create swap order
    const tx = await this.contract.createSwapOrder(
      makerNFTs,
      takerNFTs,
      params.counterpartyAddress,
      { gasLimit: 1000000 }
    );

    return await tx.wait();
  }

  async executeSwap(orderId: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await this.contract.executeSwap(orderId, { gasLimit: 500000 });
    return await tx.wait();
  }

  async cancelSwap(orderId: string) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    const tx = await this.contract.cancelSwap(orderId, { gasLimit: 200000 });
    return await tx.wait();
  }
}