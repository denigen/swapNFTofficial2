import { WalletInfo, WalletType } from '../types/wallet';

export async function detectWallet(): Promise<WalletInfo> {
  if (!window.ethereum) {
    return {
      isInstalled: false,
      type: null,
      isConnected: false,
      chainId: null,
      address: null,
    };
  }

  try {
    // Detect wallet type
    const type = detectWalletType();

    // Check if already connected
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });

    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });

    return {
      isInstalled: true,
      type,
      isConnected: accounts.length > 0,
      chainId: chainId ? parseInt(chainId, 16) : null,
      address: accounts[0] || null,
    };
  } catch (error) {
    console.error('Wallet detection error:', error);
    throw error;
  }
}

function detectWalletType(): WalletType {
  if (window.ethereum?.isMetaMask) {
    return 'MetaMask';
  }
  if (window.ethereum?.isCoinbaseWallet) {
    return 'Coinbase';
  }
  if (window.ethereum?.isWalletConnect) {
    return 'WalletConnect';
  }
  return 'Unknown';
}