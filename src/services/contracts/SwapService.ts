import { Contract, JsonRpcSigner } from 'ethers';
import { getContractAddress } from '../../config/contracts/addresses';
import { NFT_SWAP_ABI } from '../../config/contracts/abis/nftSwap';
import { NFTToken } from '../../types/nft';
import { retryWithBackoff } from '../../utils/retry';
import { createOrderEntry } from '../supabase/orders';

interface CreateSwapParams {
  fromNFTs: NFTToken[];
  toNFTs: NFTToken[];
  counterpartyAddress: string;
}

export class SwapService {
  private contract: Contract | null = null;

  constructor(
    private readonly chainId: number,
    private readonly signer: JsonRpcSigner
  ) {}

  async initialize(): Promise<void> {
    if (this.contract) return;

    try {
      const address = getContractAddress(this.chainId, 'NFT_SWAP');
      this.contract = new Contract(address, NFT_SWAP_ABI, this.signer);
    } catch (error) {
      console.error('Failed to initialize SwapService:', error);
      throw new Error('Failed to initialize swap service');
    }
  }

  async createSwapOrder(params: CreateSwapParams): Promise<{ txHash: string; orderId: string }> {
    if (!this.contract) {
      throw new Error('SwapService not initialized');
    }

    try {
      // Format NFT details
      const makerNFTs = params.fromNFTs.map(nft => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId
      }));

      const takerNFTs = params.toNFTs.map(nft => ({
        contractAddress: nft.contractAddress,
        tokenId: nft.tokenId
      }));

      // Create swap order with retry
      const tx = await retryWithBackoff(
        () => this.contract!.createSwapOrder(
          makerNFTs,
          takerNFTs,
          params.counterpartyAddress,
          { gasLimit: 1000000 }
        ),
        3,
        1000
      );

      const receipt = await tx.wait();
      
      // Get the order ID from the event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed.name === 'SwapOrderCreated';
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error('Failed to get order ID from transaction');
      }

      const parsedEvent = this.contract!.interface.parseLog(event);
      const orderId = parsedEvent.args[0];

      // Create order entry in Supabase
      const walletAddress = await this.signer.getAddress();
      await createOrderEntry({
        id: orderId,
        maker: walletAddress,
        taker: params.counterpartyAddress,
        makerNFTs: params.fromNFTs,
        takerNFTs: params.toNFTs,
        createdAt: Date.now(),
        status: 'pending',
        isActive: true,
        chainId: this.chainId
      }, walletAddress, receipt.hash);

      return { 
        txHash: receipt.hash,
        orderId 
      };
    } catch (error) {
      console.error('Failed to create swap:', error);
      throw error;
    }
  }

  async executeSwap(orderId: string): Promise<string> {
    if (!this.contract) {
      throw new Error('SwapService not initialized');
    }

    try {
      const tx = await retryWithBackoff(
        () => this.contract!.executeSwap(orderId, {
          gasLimit: 500000
        }),
        3,
        1000
      );

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw error;
    }
  }

  getContract(): Contract | null {
    return this.contract;
  }
}