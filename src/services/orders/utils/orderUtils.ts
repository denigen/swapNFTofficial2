import { SwapOrder } from '../../../types/order';

export function sortOrdersByDate(orders: SwapOrder[]): SwapOrder[] {
  return [...orders].sort((a, b) => b.createdAt - a.createdAt);
}

export function deduplicateOrders(orders: SwapOrder[]): SwapOrder[] {
  const seen = new Set<string>();
  return orders.filter(order => {
    if (seen.has(order.id)) return false;
    seen.add(order.id);
    return true;
  });
}

export function filterActiveOrders(orders: SwapOrder[]): SwapOrder[] {
  return orders.filter(order => order.isActive);
}