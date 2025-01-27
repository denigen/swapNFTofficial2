import { ChainConfig } from './types';
import { CHAIN_IDS, RPC_CONFIG } from './constants';

export const BASE_CHAIN: ChainConfig = {
  id: CHAIN_IDS.BASE,
  name: 'Base',
  symbol: 'ETH',
  icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png',
  rpcUrls: RPC_CONFIG.BASE.urls,
  blockExplorer: RPC_CONFIG.BASE.blockExplorer
};