import { useState, useEffect } from 'react';
import { detectWallet } from '../utils/walletDetection';
import { WalletInfo } from '../types/wallet';

export function useWalletDetection() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    isInstalled: false,
    type: null,
    isConnected: false,
    chainId: null,
    address: null,
  });

  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const info = await detectWallet();
        setWalletInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to detect wallet');
      } finally {
        setIsChecking(false);
      }
    };

    checkWallet();
  }, []);

  return { walletInfo, isChecking, error };
}