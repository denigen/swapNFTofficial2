import { SUPPORTED_CHAINS } from '../constants';

export function validateChainId(chainId: number): void {
  if (!SUPPORTED_CHAINS.has(chainId)) {
    throw new Error(`Chain ${chainId} not supported by OpenSea`);
  }
}

export function validateAddress(address: string): void {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address');
  }
}