import { JsonRpcProvider } from 'ethers';
import { getAllRpcUrls } from '../../config/networks/providers';
import { retryWithBackoff } from '../retry';

const PROVIDERS: Record<number, JsonRpcProvider> = {};
const FALLBACK_RPC_URLS: Record<number, string[]> = {
  33139: [
    'https://rpc.ankr.com/apechain',
    'https://rpc1.apechain.com',
    'https://rpc2.apechain.com'
  ]
};

export async function getProvider(chainId: number): Promise<JsonRpcProvider> {
  // Try cached provider first
  if (PROVIDERS[chainId]) {
    try {
      await PROVIDERS[chainId].getBlockNumber();
      return PROVIDERS[chainId];
    } catch {
      delete PROVIDERS[chainId];
    }
  }

  // Get RPC URLs with fallbacks
  const rpcUrls = [...(getAllRpcUrls(chainId) || []), ...(FALLBACK_RPC_URLS[chainId] || [])];
  if (!rpcUrls.length) {
    throw new Error(`No RPC URLs configured for chain ${chainId}`);
  }

  // Try each RPC URL with retry until one works
  for (const rpcUrl of rpcUrls) {
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      
      // Verify connection with retry
      await retryWithBackoff(
        async () => {
          const network = await provider.getNetwork();
          if (Number(network.chainId) !== chainId) {
            throw new Error('Chain ID mismatch');
          }
          return provider.getBlockNumber();
        },
        3,
        1000,
        { maxDelay: 5000 }
      );

      PROVIDERS[chainId] = provider;
      return provider;
    } catch (error) {
      console.warn(`RPC connection failed for ${rpcUrl}:`, error);
      continue;
    }
  }

  throw new Error(`No working RPC provider available for chain ${chainId}`);
}

export function clearProviderCache(chainId?: number) {
  if (chainId) {
    delete PROVIDERS[chainId];
  } else {
    Object.keys(PROVIDERS).forEach(key => delete PROVIDERS[Number(key)]);
  }
}