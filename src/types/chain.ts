export interface Chain {
  id: number;
  name: string;
  symbol: string;
  icon: string;
}

export const supportedChains: Chain[] = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
  },
  {
    id: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png'
  },
  {
    id: 1001,
    name: 'APEChain',
    symbol: 'APE',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/info/logo.png'
  }
];