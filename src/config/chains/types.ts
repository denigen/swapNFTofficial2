export interface ChainConfig {
  id: number;
  name: string;
  symbol: string;
  icon: string;
  rpcUrls: string[];
  blockExplorer: string;
}

export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}