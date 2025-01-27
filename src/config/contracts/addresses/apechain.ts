// ApeChain contract addresses
export const APECHAIN_CONTRACTS = {
  NFT_SWAP: '0x553020d1902bde2f71ae9eea828f41492127d716',
  // Known NFT contracts
  KNOWN_NFTS: [
    '0x0fb46e905e574ce11d44516a174b64b35855d3d8',
    '0x1234567890123456789012345678901234567890'
  ]
} as const;

// Chain configuration
export const APECHAIN_CHAIN_CONFIG = {
  chainId: 33139,
  name: 'ApeChain',
  rpcUrls: ['https://rpc.apechain.com/http'],
  blockExplorer: '',
  nativeCurrency: {
    name: 'APE',
    symbol: 'APE',
    decimals: 18
  }
} as const;