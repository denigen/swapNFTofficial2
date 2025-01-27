export interface ChainConfig {
  id: number;
  name: string;
  symbol: string;
  icon: string;
  rpcUrls: string[];
  blockExplorer: string;
}

export interface ContractConfig {
  address: string;
  abi: readonly string[];
}