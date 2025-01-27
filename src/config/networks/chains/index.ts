import { ChainConfig } from '../types';
import { APECHAIN_CONFIG } from './apechain';
import { BASE_CONFIG } from './base';
import { BNB_CONFIG } from './bnb';

export const chains: ChainConfig[] = [
  {
    id: APECHAIN_CONFIG.chainId,
    name: APECHAIN_CONFIG.name,
    symbol: APECHAIN_CONFIG.nativeCurrency.symbol,
    icon: 'https://raw.githubusercontent.com/fixonz/malakainvadors/refs/heads/main/yuga-labs-launches-apechain-on-ethereum.jpg',
    rpcUrls: APECHAIN_CONFIG.rpcUrls,
    blockExplorer: APECHAIN_CONFIG.blockExplorer
  },
  {
    id: BASE_CONFIG.chainId,
    name: BASE_CONFIG.name,
    symbol: 'ETH',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
    rpcUrls: BASE_CONFIG.rpcUrls,
    blockExplorer: BASE_CONFIG.blockExplorer
  },
  {
    id: BNB_CONFIG.chainId,
    name: BNB_CONFIG.name,
    symbol: 'BNB',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
    rpcUrls: BNB_CONFIG.rpcUrls,
    blockExplorer: BNB_CONFIG.blockExplorer
  }
];

export const SUPPORTED_CHAIN_IDS = chains.map(chain => chain.id);

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return chains.find(chain => chain.id === chainId);
}