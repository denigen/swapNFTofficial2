import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletState, WalletOrder } from '../types/wallet';

export const useWalletOrderStore = create<WalletState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order: WalletOrder) => set((state) => ({
        orders: [
          {
            ...order,
            createdAt: Date.now()
          },
          ...state.orders
        ].slice(0, 100) // Keep last 100 orders
      })),

      updateOrderStatus: (orderId: string, status: WalletOrder['status'], txHash?: string) => 
        set((state) => ({
          orders: state.orders.map(order => 
            order.id === orderId 
              ? { ...order, status, txHash, updatedAt: Date.now() }
              : order
          )
        })),

      getOrderById: (orderId: string) => {
        return get().orders.find(order => order.id === orderId);
      },

      getOrdersByAddress: (address: string) => {
        const normalizedAddress = address.toLowerCase();
        return get().orders.filter(order => 
          order.maker.toLowerCase() === normalizedAddress ||
          order.taker.toLowerCase() === normalizedAddress
        );
      },

      clearOrders: () => set({ orders: [] })
    }),
    {
      name: 'wallet-orders',
      version: 1,
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