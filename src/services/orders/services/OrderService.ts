import { Contract } from 'ethers';
import { Order } from '../types/Order';
import { getProvider } from '../../../utils/providers/rpcProvider';
import { getContractAddress } from '../../../config/contracts/addresses';
import { NFT_SWAP_ABI } from '../../../config/contracts/abis/nftSwap';
import { NFTMapper } from '../utils/NFTMapper';

export class OrderService {
  private contract: Contract;
  private nftMapper: NFTMapper;

  constructor(chainId: number) {
    const provider = getProvider(chainId);
    const address = getContractAddress(chainId, 'NFT_SWAP');
    this.contract = new Contract(address, NFT_SWAP_ABI, provider);
    this.nftMapper = new NFTMapper(chainId);
  }

  async getPendingOrders(address: string): Promise<Order[]> {
    if (!address) {
      throw new Error('Invalid address provided');
    }

    try {
      // Get events for both maker and taker
      const filter = this.contract.filters.SwapOrderCreated(null, null, null);
      const events = await this.contract.queryFilter(filter);

      const pendingOrders: Order[] = [];
      const seenIds = new Set<string>();

      for (const event of events) {
        const orderId = event.args?.orderId;
        if (!orderId || seenIds.has(orderId)) continue;
        seenIds.add(orderId);

        try {
          const order = await this.contract.swapOrders(orderId);
          if (!order.isActive) continue;

          const maker = order.maker.toLowerCase();
          const taker = order.taker.toLowerCase();
          const userAddress = address.toLowerCase();

          if (maker === userAddress || taker === userAddress) {
            pendingOrders.push({
              id: orderId,
              maker,
              taker,
              createdAt: Number(order.createdAt),
              status: 'pending',
              makerNFTs: this.nftMapper.mapNFTs(order.makerNFTs),
              takerNFTs: this.nftMapper.mapNFTs(order.takerNFTs),
              isActive: order.isActive
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch order ${orderId}:`, error);
        }
      }

      return pendingOrders;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw new Error('Failed to fetch pending orders');
    }
  }
}