import { Contract } from 'ethers';
import { SwapOrder } from '../../types/order';
import { retryWithBackoff } from '../../utils/retry';
import { NFTToken } from '../../types/nft';

export class OrderQueryService {
  constructor(private readonly contract: Contract) {}

  async getOrderDetails(orderId: string): Promise<SwapOrder | null> {
    try {
      // Get order details with retry
      const order = await retryWithBackoff(
        () => this.contract.swapOrders(orderId),
        3,
        1000,
        { maxDelay: 5000 }
      );

      if (!order.isActive) return null;

      // Map NFT details
      const makerNFTs = this.mapNFTDetails(order.makerNFTs);
      const takerNFTs = this.mapNFTDetails(order.takerNFTs);

      return {
        id: orderId,
        maker: order.maker.toLowerCase(),
        taker: order.taker.toLowerCase(),
        makerNFTs,
        takerNFTs,
        createdAt: Number(order.createdAt),
        isActive: order.isActive,
        status: 'pending'
      };
    } catch (error) {
      console.warn(`Failed to fetch order ${orderId}:`, error);
      return null;
    }
  }

  private mapNFTDetails(nfts: any[]): NFTToken[] {
    return nfts.map((nft, index) => ({
      id: `${nft.contractAddress}-${nft.tokenId}`,
      name: `NFT #${nft.tokenId}`,
      collection: 'Collection',
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400',
      contractAddress: nft.contractAddress.toLowerCase(),
      tokenId: nft.tokenId.toString(),
      chainId: this.getChainId(),
      standard: 'ERC721'
    }));
  }

  private getChainId(): number {
    return this.contract.provider.network.chainId;
  }
}