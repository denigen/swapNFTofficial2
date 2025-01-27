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
  },
  {
    id: 33139,
    name: 'ApeChain',
    symbol: 'APE',
    icon: 'https://raw.githubusercontent.com/fixonz/malakainvadors/refs/heads/main/yuga-labs-launches-apechain-on-ethereum.jpg',
    rpcUrls: [
      'https://rpc.ankr.com/apechain',
      'https://rpc1.apechain.com',
      'https://rpc2.apechain.com'
    ],
    blockExplorer: 'https://explorer.apechain.com'
  },
  {
    id: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
    rpcUrls: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc.nodereal.io'
    ],
    blockExplorer: 'https://bscscan.com'
  }
];

export const SUPPORTED_CHAIN_IDS = chains.map(chain => chain.id);

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return chains.find(chain => chain.id === chainId);
}