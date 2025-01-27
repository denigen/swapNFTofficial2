import { useState, useEffect, useCallback } from 'react';
import { useWalletStore } from '../../../stores/useWalletStore';
import { OrderService } from '../services/OrderService';
import { Order, OrderQueryResult } from '../types/Order';
import { retryWithBackoff } from '../../../utils/retry';

const REFRESH_INTERVAL = 30000; // 30 seconds

export function usePendingOrders(): OrderQueryResult {
  const { address, chainId, isConnected } = useWalletStore();
  const [result, setResult] = useState<OrderQueryResult>({
    orders: [],
    isLoading: false
  });

  const fetchOrders = useCallback(async () => {
    if (!isConnected || !address || !chainId) {
      setResult({ orders: [], isLoading: false });
      return;
    }

    setResult(prev => ({ ...prev, isLoading: true }));

    try {
      const orderService = new OrderService(chainId);
      const orders = await retryWithBackoff(
        () => orderService.getPendingOrders(address),
        3,
        1000,
        { maxDelay: 5000 }
      );

      setResult({
        orders: orders.sort((a, b) => b.createdAt - a.createdAt),
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
      setResult({
        orders: [],
        error: 'Failed to load orders. Please try again.',
        isLoading: false
      });
    }
  }, [address, chainId, isConnected]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up polling
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchOrders, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrders, isConnected]);

  return result;
}