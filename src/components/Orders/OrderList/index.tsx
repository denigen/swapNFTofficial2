import React, { useState } from 'react';
import { SwapOrder, OrderStatus } from '../../../types/order';
import { OrderCard } from './OrderCard';
import { OrderFilters } from './OrderFilters';
import { EmptyState } from './EmptyState';

interface OrderListProps {
  orders: SwapOrder[];
  onOrderComplete?: () => void;
}

export function OrderList({ orders, onOrderComplete }: OrderListProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus>();

  const filteredOrders = statusFilter
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  return (
    <div className="space-y-6">
      <OrderFilters 
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />
      
      {filteredOrders.length === 0 ? (
        <EmptyState filterType={statusFilter} />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOrderComplete={onOrderComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}