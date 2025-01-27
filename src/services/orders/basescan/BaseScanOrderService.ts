import { basescan, TokenTransferEvent } from '../../basescan';
import { SwapOrder } from '../../../types/order';
import { retryWithBackoff } from '../../../utils/retry';
import { NFTMapper } from '../utils/NFTMapper';

export class BaseScanOrderService {
  private nftMapper: NFTMapper;

  constructor(private readonly chainId: number) {
    this.nftMapper = new NFTMapper(chainId);
  }

  async getOrderEvents(contractAddress: string, fromBlock: number): Promise<TokenTransferEvent[]> {
    try {
      return await retryWithBackoff(
        () => basescan.token.getTokenTransfers(contractAddress, fromBlock),
        3,
        1000
      );
    } catch (error) {
      console.error('Failed to fetch BASE Scan events:', error);
      return [];
    }
  }

  async enrichOrderData(order: SwapOrder): Promise<SwapOrder> {
    try {
      // Get transfer history for maker NFTs
      const makerTransfers = await Promise.all(
        order.makerNFTs.map(nft =>
          basescan.token.getNFTTransfers(nft.contractAddress, nft.tokenId)
        )
      );

      // Get transfer history for taker NFTs
      const takerTransfers = await Promise.all(
        order.takerNFTs.map(nft =>
          basescan.token.getNFTTransfers(nft.contractAddress, nft.tokenId)
        )
      );

      // Verify ownership through transfer history
      const isValid = this.verifyOrderValidity(order, makerTransfers.flat(), takerTransfers.flat());

      return {
        ...order,
        isActive: order.isActive && isValid
      };
    } catch (error) {
      console.warn('Failed to enrich order data:', error);
      return order;
    }
  }

  private verifyOrderValidity(
    order: SwapOrder,
    makerTransfers: TokenTransferEvent[],
    takerTransfers: TokenTransferEvent[]
  ): boolean {
    // Verify maker still owns their NFTs
    const makerOwnsAll = order.makerNFTs.every(nft => {
      const lastTransfer = makerTransfers.find(t => 
        t.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase() &&
        t.tokenID === nft.tokenId
      );
      return lastTransfer?.to.toLowerCase() === order.maker.toLowerCase();
    });

    // Verify taker still owns their NFTs
    const takerOwnsAll = order.takerNFTs.every(nft => {
      const lastTransfer = takerTransfers.find(t =>
        t.contractAddress.toLowerCase() === nft.contractAddress.toLowerCase() &&
        t.tokenID === nft.tokenId
      );
      return lastTransfer?.to.toLowerCase() === order.taker.toLowerCase();
    });

    return makerOwnsAll && takerOwnsAll;
  }
}