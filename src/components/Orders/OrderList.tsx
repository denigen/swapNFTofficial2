import React from 'react';
import { SwapOrder } from '../../types/order';
import OrderCard from './OrderCard';

interface OrderListProps {
  orders: SwapOrder[];
  onOrderComplete?: () => void;
}

export default function OrderList({ orders, onOrderComplete }: OrderListProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onOrderComplete={onOrderComplete}
        />
      ))}
    </div>
  );
}