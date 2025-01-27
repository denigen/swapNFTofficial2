import { ALCHEMY_CONFIG } from '../api/alchemy';

const RPC_URLS: Record<number, string[]> = {
  1: [
    `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_CONFIG.API_KEY}`,
    'https://eth-mainnet.public.blastapi.io',
    'https://rpc.ankr.com/eth'
  ],
  11155111: [
    `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_CONFIG.API_KEY}`,
    'https://rpc.sepolia.org',
    'https://eth-sepolia.public.blastapi.io'
  ],
  8453: [
    `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_CONFIG.API_KEY}`,
    'https://mainnet.base.org',
    'https://base.blockpi.network/v1/rpc/public',
    'https://1rpc.io/base',
    'https://base.meowrpc.com',
    'https://base.drpc.org',
    'https://base.gateway.tenderly.co',
    'https://base-rpc.publicnode.com',
    'https://endpoints.omniatech.io/v1/base/mainnet/public'
  ],
  56: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed1.ninicoin.io',
    'https://bsc.nodereal.io',
    'https://bsc-mainnet.public.blastapi.io',
    'https://binance.llamarpc.com'
  ]
};

export function getRpcUrl(chainId: number): string {
  const urls = RPC_URLS[chainId];
  if (!urls?.length) {
    throw new Error(`No RPC URLs configured for chain ID ${chainId}`);
  }
  return urls[0];
}

export function getAllRpcUrls(chainId: number): string[] {
  return RPC_URLS[chainId] || [];
}