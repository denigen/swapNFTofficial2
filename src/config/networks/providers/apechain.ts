import { APECHAIN_CONFIG } from '../chains/apechain';

export const APECHAIN_RPC_CONFIG = {
  primary: APECHAIN_CONFIG.rpcUrls[0],
  timeout: 10000,
  reconnectDelay: 1000,
  maxRetries: 3
};

export function createApeChainProvider() {
  if (!window.WebSocket) {
    throw new Error('WebSocket not supported in this environment');
  }

  return {
    chainId: APECHAIN_CONFIG.chainId,
    rpcUrl: APECHAIN_RPC_CONFIG.primary,
    connect: async () => {
      try {
        const ws = new WebSocket(APECHAIN_RPC_CONFIG.primary);
        return new Promise((resolve, reject) => {
          ws.onopen = () => resolve(ws);
          ws.onerror = (error) => reject(error);
          setTimeout(() => reject(new Error('Connection timeout')), APECHAIN_RPC_CONFIG.timeout);
        });
      } catch (error) {
        throw new Error(`Failed to connect to ApeChain: ${error.message}`);
      }
    }
  };
}