import { create } from 'zustand';
import { BrowserProvider } from 'ethers';
import { WalletState } from '../types/wallet';
import { createProvider, getRPCProvider } from '../utils/provider';
import { setupWalletListeners, cleanupWalletListeners } from '../utils/walletUtils';
import { useOrderStore } from './useOrderStore';

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnected: false,
  address: null,
  chainId: null,
  provider: null,
  signer: null,
  error: null,
  isConnecting: false,

  connect: async () => {
    if (get().isConnecting) {
      console.log('Connection already in progress');
      return;
    }

    try {
      set({ isConnecting: true, error: null });

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      console.log('Requesting account access...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts?.length) {
        throw new Error('No accounts found');
      }

      console.log('Account connected:', accounts[0]);

      // Get chain ID first
      const chainIdHex = await window.ethereum.request({
        method: 'eth_chainId'
      });
      const chainId = parseInt(chainIdHex, 16);
      console.log('Connected to chain:', chainId);

      // Create provider with error handling
      let provider: BrowserProvider;
      try {
        console.log('Creating Web3 provider...');
        provider = await createProvider(window.ethereum);
      } catch (error) {
        console.error('Primary provider failed, trying RPC fallback');
        const rpcProvider = await getRPCProvider(chainId);
        if (!rpcProvider) {
          throw new Error('No working provider available');
        }
        provider = new BrowserProvider(rpcProvider);
      }

      console.log('Getting signer...');
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      const walletAddress = accounts[0];
      set({
        isConnected: true,
        address: walletAddress,
        chainId: Number(network.chainId),
        provider,
        signer,
        error: null
      });

      // Sync orders for the connected wallet
      useOrderStore.getState().syncOrders(walletAddress);

      console.log('Setting up wallet listeners...');
      setupWalletListeners(set, get);

    } catch (error) {
      console.error('Wallet connection failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        isConnected: false,
        address: null,
        chainId: null,
        provider: null,
        signer: null
      });
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    console.log('Disconnecting wallet...');
    cleanupWalletListeners();
    useOrderStore.getState().clearOrders();
    set({
      isConnected: false,
      address: null,
      chainId: null,
      provider: null,
      signer: null,
      error: null
    });
  }
}));