import { Chain } from '../../types/chain';

export const BNB_CHAIN: Chain = {
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
  blockExplorer: 'https://bscscan.com',
  startBlock: 5000000 // Start from a reasonable block number
};