import { Contract } from 'ethers';
import { SwapOrder } from '../../../types/order';

export const SWAP_EVENT_TOPICS = {
  CREATED: '0x20349c2498759f7e31a0d7a77f1d58067d0e8b3c09c8a02b4bd42fc32bfebfa0'
};

export async function getSwapEvents(
  contract: Contract,
  address: string,
  fromBlock: number
): Promise<SwapOrder[]> {
  try {
    // Create filter for maker orders
    const makerFilter = contract.filters.SwapOrderCreated(address);
    const makerEvents = await contract.queryFilter(makerFilter, fromBlock);

    // Create filter for taker orders
    const takerFilter = contract.filters.SwapOrderCreated(null, null, address);
    const takerEvents = await contract.queryFilter(takerFilter, fromBlock);

    // Combine and deduplicate events
    const allEvents = [...makerEvents, ...takerEvents];
    const seenIds = new Set<string>();
    
    const orders = await Promise.all(
      allEvents.map(async (event) => {
        try {
          if (seenIds.has(event.args!.orderId)) return null;
          seenIds.add(event.args!.orderId);

          const order = await contract.swapOrders(event.args!.orderId);
          if (!order.isActive) return null;

          return {
            id: event.args!.orderId,
            maker: order.maker,
            taker: order.taker,
            makerNFTs: order.makerNFTs,
            takerNFTs: order.takerNFTs,
            createdAt: Number(order.createdAt),
            isActive: order.isActive,
            status: 'pending'
          };
        } catch (error) {
          console.warn(`Failed to fetch order details:`, error);
          return null;
        }
      })
    );

    return orders.filter((order): order is SwapOrder => order !== null);
  } catch (error) {
    console.error('Failed to fetch swap events:', error);
    throw new Error('Failed to load swap orders');
  }
}