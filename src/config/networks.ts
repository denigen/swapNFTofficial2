export const networkConfigs = {
  11155111: { // Sepolia
    rpcUrls: [
      'https://eth-sepolia.g.alchemy.com/v2/demo',
      'https://rpc.sepolia.org',
      'https://sepolia.infura.io/v3/your-project-id'
    ],
    blockExplorer: 'https://sepolia.etherscan.io',
    name: 'Sepolia',
    symbol: 'ETH',
    chainId: 11155111
  }
} as const;

export function getNetworkConfig(chainId: number) {
  return networkConfigs[chainId as keyof typeof networkConfigs];
}