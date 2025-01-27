import { BrowserProvider } from 'ethers';
import { Chain } from '../types/chain';
import { WalletState } from '../types/wallet';
import { networkConfigs } from '../config/networks';

type SetState = (
  partial: WalletState | Partial<WalletState> | ((state: WalletState) => WalletState | Partial<WalletState>),
  replace?: boolean | undefined
) => void;

type GetState = () => WalletState;

let accountsChangedListener: ((accounts: string[]) => void) | null = null;
let chainChangedListener: ((chainId: string) => void) | null = null;
let disconnectListener: (() => void) | null = null;

export function setupWalletListeners(set: SetState, get: GetState): void {
  if (!window.ethereum) {
    console.error('MetaMask not detected');
    return;
  }

  // Remove any existing listeners first
  cleanupWalletListeners();

  accountsChangedListener = async (accounts: string[]) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      console.log('User disconnected wallet');
      get().disconnect();
    } else {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log('New signer created for account:', accounts[0]);
        set({ address: accounts[0], signer });
      } catch (error) {
        console.error('Failed to update signer after account change:', error);
        get().disconnect();
      }
    }
  };

  chainChangedListener = async (chainId: string) => {
    console.log('Chain changed to:', chainId);
    try {
      const numericChainId = parseInt(chainId, 16);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      console.log('Network details:', {
        chainId: numericChainId,
        name: network.name,
        provider: provider !== null
      });
      set({ chainId: numericChainId, provider, signer });
    } catch (error) {
      console.error('Failed to handle chain change:', error);
      get().disconnect();
    }
  };

  disconnectListener = () => {
    console.log('Wallet disconnect event received');
    get().disconnect();
  };

  window.ethereum.on('accountsChanged', accountsChangedListener);
  window.ethereum.on('chainChanged', chainChangedListener);
  window.ethereum.on('disconnect', disconnectListener);

  // Verify initial connection
  verifyInitialConnection(set, get);
}

async function verifyInitialConnection(set: SetState, get: GetState) {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    console.log('Initial connection state:', {
      accounts,
      chainId,
      isConnected: accounts.length > 0
    });

    if (accounts.length > 0) {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      set({
        isConnected: true,
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        provider,
        signer
      });
    }
  } catch (error) {
    console.error('Failed to verify initial connection:', error);
  }
}

export function cleanupWalletListeners(): void {
  if (!window.ethereum) return;

  if (accountsChangedListener) {
    window.ethereum.removeListener('accountsChanged', accountsChangedListener);
    accountsChangedListener = null;
  }
  if (chainChangedListener) {
    window.ethereum.removeListener('chainChanged', chainChangedListener);
    chainChangedListener = null;
  }
  if (disconnectListener) {
    window.ethereum.removeListener('disconnect', disconnectListener);
    disconnectListener = null;
  }
}

// Add transaction error handling
export async function handleTransaction<T>(
  transactionPromise: Promise<T>,
  errorHandler?: (error: any) => void
): Promise<T | null> {
  try {
    return await transactionPromise;
  } catch (error: any) {
    console.error('Transaction error:', error);
    
    // Handle user rejection
    if (error.code === 4001 || error.message?.includes('user rejected')) {
      console.log('User rejected transaction');
      return null;
    }
    
    // Handle other errors
    if (errorHandler) {
      errorHandler(error);
    }
    
    return null;
  }
}

export async function switchToChain(chain: Chain): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  const chainIdHex = `0x${chain.id.toString(16)}`;
  console.log('Attempting to switch to chain:', chainIdHex);
  
  try {
    await handleTransaction(
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    );
    console.log('Successfully switched chain');
  } catch (error: any) {
    console.log('Chain switch error:', error);
    // If the chain hasn't been added to MetaMask (error code 4902)
    if (error.code === 4902) {
      console.log('Chain not found, attempting to add it');
      await addChainToWallet(chain);
    } else {
      throw error;
    }
  }
}

async function addChainToWallet(chain: Chain): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not detected');
  }

  const config = networkConfigs[chain.id];
  if (!config) {
    throw new Error(`Network configuration not found for chain ID ${chain.id}`);
  }

  console.log('Adding chain to wallet:', chain.name);
  
  const params = {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: {
      name: chain.symbol,
      symbol: chain.symbol,
      decimals: 18,
    },
    rpcUrls: config.rpcUrls,
    blockExplorerUrls: [config.blockExplorer],
  };

  try {
    await handleTransaction(
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params],
      })
    );
    console.log('Successfully added chain to wallet');
  } catch (error) {
    console.error('Failed to add chain to wallet:', error);
    throw error;
  }
}