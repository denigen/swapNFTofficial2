export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrls: string[];
  blockExplorer: string;
  startBlock: number;
  batchSize: number;
  requestDelay: number;
  maxBlockRange?: number;
}