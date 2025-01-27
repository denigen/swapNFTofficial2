import { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';

// Mock transaction data for demonstration
const mockTransactions: Transaction[] = [
  {
    id: '1',
    fromNFT: {
      id: '1',
      name: 'Bored Ape #1234',
      collection: 'BAYC',
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
      contractAddress: '0x123...',
      tokenId: '1234',
      chainId: 1
    },
    toNFT: {
      id: '2',
      name: 'Azuki #5678',
      collection: 'Azuki',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
      contractAddress: '0x456...',
      tokenId: '5678',
      chainId: 1
    },
    fromAddress: '0x1234567890123456789012345678901234567890',
    toAddress: '0x0987654321098765432109876543210987654321',
    timestamp: Date.now() - 3600000,
    status: 'completed',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    chainId: 1
  }
];

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadTransactions = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return { transactions, loading };
}