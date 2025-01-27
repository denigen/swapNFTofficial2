import { Transaction, TransactionFilters } from '../types/transaction';
import { NFTToken } from '../types/nft';

// Mock NFT data
const mockNFTs: NFTToken[] = [
  {
    id: '1',
    name: 'Bored Ape #1234',
    collection: 'Bored Ape Yacht Club',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',
    contractAddress: '0x123...',
    tokenId: '1234',
    chainId: 1
  },
  {
    id: '2',
    name: 'Azuki #5678',
    collection: 'Azuki',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
    contractAddress: '0x456...',
    tokenId: '5678',
    chainId: 1
  }
];

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    fromNFT: mockNFTs[0],
    toNFT: mockNFTs[1],
    fromAddress: '0x1234567890123456789012345678901234567890',
    toAddress: '0x0987654321098765432109876543210987654321',
    timestamp: Date.now() - 3600000,
    status: 'completed',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    chainId: 1
  }
];

export async function fetchTransactionHistory(filters: TransactionFilters): Promise<Transaction[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  let filtered = [...mockTransactions];

  if (filters.status) {
    filtered = filtered.filter(tx => tx.status === filters.status);
  }

  if (filters.chainId) {
    filtered = filtered.filter(tx => tx.chainId === filters.chainId);
  }

  if (filters.timeRange && filters.timeRange !== 'all') {
    const now = Date.now();
    const ranges = {
      day: now - 86400000,
      week: now - 604800000,
      month: now - 2592000000
    };

    filtered = filtered.filter(tx => 
      tx.timestamp >= ranges[filters.timeRange as keyof typeof ranges]
    );
  }

  return filtered;
}