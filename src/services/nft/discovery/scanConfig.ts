import { JsonRpcProvider } from 'ethers';
import { getNetworkConfig } from '../../../config/networks';

export interface ScanConfig {
  fromBlock: number;
  toBlock: number;
  batchSize: number;
  delayMs: number;
  maxRetries: number;
}

export async function getScanConfig(
  provider: JsonRpcProvider,
  chainId: number
): Promise<ScanConfig> {
  const networkConfig = getNetworkConfig(chainId);
  if (!networkConfig) {
    throw new Error(`No configuration found for chain ID ${chainId}`);
  }

  const latestBlock = await provider.getBlockNumber();
  
  return {
    fromBlock: networkConfig.startBlock,
    toBlock: latestBlock,
    batchSize: networkConfig.batchSize || 2000,
    delayMs: networkConfig.requestDelay || 100,
    maxRetries: 3
  };
}