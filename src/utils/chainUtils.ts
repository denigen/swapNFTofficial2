import { Chain } from '../types/chain';
import { clearProviderCache } from './providers/rpcProvider';

const CHAIN_CONFIGS: Record<number, {
  chainId: string;
  rpcUrls: string[];
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
}> = {
  8453: {
    chainId: '0x2105',
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.blockpi.network/v1/rpc/public'
    ],
    chainName: 'Base',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://basescan.org']
  },
  33139: {
    chainId: '0x8173',
    rpcUrls: [
      'https://rpc.ankr.com/apechain',
      'https://rpc1.apechain.com',
      'https://rpc2.apechain.com'
    ],
    chainName: 'ApeChain',
    nativeCurrency: {
      name: 'APE',
      symbol: 'APE',
      decimals: 18
    },
    blockExplorerUrls: ['https://explorer.apechain.com']
  },
  56: {
    chainId: '0x38',
    rpcUrls: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed1.ninicoin.io'
    ],
    chainName: 'BNB Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    blockExplorerUrls: ['https://bscscan.com']
  }
};

export async function switchChain(chain: Chain): Promise<void> {
  if (!window.ethereum) throw new Error('No Web3 wallet found');

  const chainIdHex = `0x${chain.id.toString(16)}`;
  const config = CHAIN_CONFIGS[chain.id];
  
  if (!config) {
    throw new Error(`Chain configuration not found for chain ID ${chain.id}`);
  }

  try {
    // Clear provider cache for the current chain
    clearProviderCache(chain.id);

    // Try switching chain first
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error: any) {
    // If chain hasn't been added to MetaMask (error code 4902)
    if (error.code === 4902 || error.message?.includes('Unrecognized chain ID')) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            chainName: config.chainName,
            nativeCurrency: config.nativeCurrency,
            rpcUrls: config.rpcUrls,
            blockExplorerUrls: config.blockExplorerUrls
          }]
        });
      } catch (addError: any) {
        console.error('Failed to add chain:', addError);
        throw new Error(addError.message || 'Failed to add network to wallet');
      }
    } else {
      console.error('Failed to switch chain:', error);
      throw new Error(error.message || 'Failed to switch network');
    }
  }
}