import { SwapOrder } from './types';

const CACHE_DURATION = 30000; // 30 seconds

interface CacheEntry {
  orders: SwapOrder[];
  timestamp: number;
}

export class OrderCacheService {
  private cache: Map<string, CacheEntry> = new Map();

  getOrders(address: string): SwapOrder[] | null {
    const entry = this.cache.get(address);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(address);
      return null;
    }

    return entry.orders;
  }

  setOrders(address: string, orders: SwapOrder[]): void {
    this.cache.set(address, {
      orders,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}