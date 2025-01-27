import { useState, useEffect, useCallback } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { useOrderStore } from '../stores/useOrderStore';
import { getOrdersByAddress } from '../services/supabase/orders';
import { SwapOrder } from '../types/order';

export function useOrders() {
  const { address, isConnected } = useWalletStore();
  const [orders, setOrders] = useState<SwapOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncOrders = useOrderStore(state => state.syncOrders);

  const fetchOrders = useCallback(async () => {
    if (!isConnected || !address) {
      setOrders([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching orders for address:', address);
      const fetchedOrders = await getOrdersByAddress(address);
      console.log('Fetched orders:', fetchedOrders);
      
      if (Array.isArray(fetchedOrders)) {
        setOrders(fetchedOrders);
        // Sync with local store
        syncOrders(address);
      } else {
        console.error('Invalid orders data received:', fetchedOrders);
        setError('Invalid data format received');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, syncOrders]);

  // Initial fetch
  useEffect(() => {
    if (isConnected && address) {
      fetchOrders();
    }
  }, [isConnected, address, fetchOrders]);

  // Refresh every 15 seconds
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [isConnected, address, fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refresh: fetchOrders
  };
}