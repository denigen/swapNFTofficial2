import { NetworkConfig } from './types';
import { ETHEREUM_CONFIG } from './chains/ethereum';
import { BASE_CONFIG } from './chains/base';

export const NETWORK_CONFIGS: Record<number, NetworkConfig> = {
  [ETHEREUM_CONFIG.chainId]: ETHEREUM_CONFIG,
  [BASE_CONFIG.chainId]: BASE_CONFIG
};

export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return NETWORK_CONFIGS[chainId];
}

export * from './types';
export * from './chains';