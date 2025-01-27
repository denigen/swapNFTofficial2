import { useState, useEffect } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { useWalletOrderStore } from '../stores/useWalletOrderStore';
import { WalletOrder } from '../types/wallet';

interface UseWalletOrdersResult {
  orders: WalletOrder[];
  pendingOrders: WalletOrder[];
  completedOrders: WalletOrder[];
  cancelledOrders: WalletOrder[];
  isLoading: boolean;
  error: string | null;
}

export function useWalletOrders(): UseWalletOrdersResult {
  const { address } = useWalletStore();
  const getOrdersByAddress = useWalletOrderStore(state => state.getOrdersByAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<WalletOrder[]>([]);

  useEffect(() => {
    if (!address) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userOrders = getOrdersByAddress(address);
      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching wallet orders:', err);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [address, getOrdersByAddress]);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');

  return {
    orders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    isLoading,
    error
  };
}