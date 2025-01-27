import { baseClient } from '../client';
import { BASE_API_CONFIG } from '../../../config/api/base';
import { SwapOrder } from '../../../types/order';

export class OrderAPI {
  async getOrderEvents(
    contractAddress: string,
    fromBlock: number,
    toBlock?: number
  ) {
    return baseClient.fetch(BASE_API_CONFIG.ENDPOINTS.EVENT, {
      address: contractAddress,
      fromBlock: fromBlock.toString(),
      toBlock: toBlock?.toString() || 'latest',
      topic0: '0x20349c2498759f7e31a0d7a77f1d58067d0e8b3c09c8a02b4bd42fc32bfebfa0'
    });
  }

  async getOrderDetails(orderId: string) {
    return baseClient.fetch(BASE_API_CONFIG.ENDPOINTS.CONTRACT, {
      action: 'getOrder',
      orderId
    });
  }

  async validateOrder(order: SwapOrder) {
    const ownershipPromises = [
      ...order.makerNFTs.map(nft =>
        this.validateNFTOwnership(nft.contractAddress, nft.tokenId, order.maker)
      ),
      ...order.takerNFTs.map(nft =>
        this.validateNFTOwnership(nft.contractAddress, nft.tokenId, order.taker)
      )
    ];

    const results = await Promise.all(ownershipPromises);
    return results.every(result => result);
  }

  private async validateNFTOwnership(
    contractAddress: string,
    tokenId: string,
    owner: string
  ): Promise<boolean> {
    try {
      const result = await baseClient.fetch(BASE_API_CONFIG.ENDPOINTS.TOKEN, {
        action: 'tokeninfo',
        contractaddress: contractAddress,
        tokenid: tokenId
      });

      return result.owner.toLowerCase() === owner.toLowerCase();
    } catch (error) {
      console.warn('Failed to validate NFT ownership:', error);
      return false;
    }
  }
}

export const orderApi = new OrderAPI();