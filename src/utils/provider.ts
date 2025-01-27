import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { getNetworkConfig } from '../config/networks';

export async function createProvider(ethereum: any): Promise<BrowserProvider> {
  if (!ethereum || typeof ethereum.request !== 'function') {
    throw new Error('Invalid Ethereum provider');
  }

  try {
    console.log('Creating browser provider...');
    const provider = new BrowserProvider(ethereum, 'any');
    
    // Verify provider works
    const network = await provider.getNetwork();
    console.log('Provider connected to network:', {
      chainId: network.chainId,
      name: network.name
    });
    
    return provider;
  } catch (error) {
    console.error('Provider creation failed:', error);
    throw error;
  }
}

export async function getRPCProvider(chainId: number): Promise<JsonRpcProvider | null> {
  const config = getNetworkConfig(chainId);
  if (!config?.rpcUrls?.length) {
    console.error('No RPC URLs configured for chain:', chainId);
    return null;
  }

  console.log('Attempting RPC connections for chain:', chainId);

  // Try each RPC URL until one works
  for (const rpcUrl of config.rpcUrls) {
    try {
      console.log('Trying RPC URL:', rpcUrl);
      const provider = new JsonRpcProvider(rpcUrl);
      
      // Verify connection
      const network = await provider.getNetwork();
      if (Number(network.chainId) === chainId) {
        console.log('Successfully connected to RPC:', rpcUrl);
        return provider;
      }
      console.warn('Chain ID mismatch for RPC:', rpcUrl);
    } catch (error) {
      console.warn(`RPC connection failed for ${rpcUrl}:`, error);
      continue;
    }
  }
  
  console.error('No working RPC providers found');
  return null;
}