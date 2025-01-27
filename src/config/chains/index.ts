import { ChainConfig } from './types';

export const chains: ChainConfig[] = [
  {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.blockpi.network/v1/rpc/public',
      'https://1rpc.io/base'
    ],
    blockExplorer: 'https://basescan.org'
  }
];

export const SUPPORTED_CHAIN_IDS = chains.map(chain => chain.id);

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return chains.find(chain => chain.id === chainId);
}