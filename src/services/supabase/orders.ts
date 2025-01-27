import { supabase } from './client';
import { SwapOrder } from '../../types/order';

export async function createOrderEntry(
  order: SwapOrder,
  walletAddress: string,
  txHash?: string
) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        order_id: order.id,
        maker: order.maker.toLowerCase(),
        taker: order.taker.toLowerCase(),
        maker_nfts: order.makerNFTs,
        taker_nfts: order.takerNFTs,
        created_at: new Date(order.createdAt).toISOString(),
        status: order.status,
        tx_hash: txHash,
        chain_id: order.chainId,
        is_active: order.isActive
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating order entry:', error);
    throw error;
  }
}

export async function getOrdersByAddress(walletAddress: string): Promise<SwapOrder[]> {
  try {
    console.log('Fetching orders for wallet:', walletAddress);
    const normalizedAddress = walletAddress.toLowerCase();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(
        `wallet_address.eq.${normalizedAddress},` +
        `maker.eq.${normalizedAddress},` +
        `taker.eq.${normalizedAddress}`
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log('Raw orders data:', data);

    if (!data) return [];

    return data.map(order => ({
      id: order.order_id,
      maker: order.maker,
      taker: order.taker,
      makerNFTs: order.maker_nfts,
      takerNFTs: order.taker_nfts,
      createdAt: new Date(order.created_at).getTime(),
      status: order.status,
      isActive: order.is_active,
      chainId: order.chain_id
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: SwapOrder['status'],
  txHash?: string
) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        tx_hash: txHash,
        is_active: status === 'pending'
      })
      .eq('order_id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}