import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SwapOrder } from '../types/order';

interface OrderState {
  orders: SwapOrder[];
  addOrder: (order: SwapOrder) => void;
  updateOrderStatus: (orderId: string, status: SwapOrder['status']) => void;
  getOrders: () => SwapOrder[];
  clearOrders: () => void;
  syncOrders: (walletAddress: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order) => {
        set((state) => {
          const newOrders = [order, ...state.orders].slice(0, 50); // Keep last 50 orders
          
          // Save to local storage with wallet address
          if (window.ethereum?.selectedAddress) {
            try {
              localStorage.setItem(
                `orders_${window.ethereum.selectedAddress.toLowerCase()}`,
                JSON.stringify(newOrders)
              );
            } catch (error) {
              console.error('Error saving orders to local storage:', error);
            }
          }
          
          return { orders: newOrders };
        });
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => {
          const updatedOrders = state.orders.map(order => 
            order.id === orderId 
              ? { ...order, status, isActive: status === 'pending' }
              : order
          );

          // Update local storage
          if (window.ethereum?.selectedAddress) {
            try {
              localStorage.setItem(
                `orders_${window.ethereum.selectedAddress.toLowerCase()}`,
                JSON.stringify(updatedOrders)
              );
            } catch (error) {
              console.error('Error updating orders in local storage:', error);
            }
          }

          return { orders: updatedOrders };
        });
      },

      getOrders: () => get().orders,

      clearOrders: () => {
        set({ orders: [] });
        // Clear from local storage
        if (window.ethereum?.selectedAddress) {
          localStorage.removeItem(`orders_${window.ethereum.selectedAddress.toLowerCase()}`);
        }
      },

      syncOrders: (walletAddress: string) => {
        try {
          const storedOrders = localStorage.getItem(`orders_${walletAddress.toLowerCase()}`);
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders) as SwapOrder[];
            // Validate order data
            const validOrders = parsedOrders.filter(order => {
              return (
                order.id &&
                order.maker &&
                order.taker &&
                order.makerNFTs?.length > 0 &&
                order.takerNFTs?.length > 0 &&
                order.createdAt &&
                typeof order.isActive === 'boolean' &&
                ['pending', 'completed', 'cancelled'].includes(order.status)
              );
            });
            set({ orders: validOrders });
          }
        } catch (error) {
          console.error('Error syncing orders from local storage:', error);
          set({ orders: [] });
        }
      }
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        orders: state.orders.map(order => ({
          ...order,
          makerNFTs: order.makerNFTs.map(nft => ({
            ...nft,
            imageUrl: '' // Don't persist image URLs
          })),
          takerNFTs: order.takerNFTs.map(nft => ({
            ...nft,
            imageUrl: '' // Don't persist image URLs
          }))
        }))
      })
    }
  )
);