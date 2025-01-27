import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwapCard from '../components/SwapCard/SwapCard';
import { useWalletStore } from '../stores/useWalletStore';

// Mock the wallet store
vi.mock('../stores/useWalletStore', () => ({
  useWalletStore: vi.fn()
}));

describe('SwapCard', () => {
  beforeEach(() => {
    // Reset mock wallet store state
    useWalletStore.mockImplementation(() => ({
      isConnected: false,
      address: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      error: null,
      isConnecting: false
    }));
  });

  it('renders connect wallet button when wallet is not connected', () => {
    render(<SwapCard />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows NFT selection buttons', () => {
    render(<SwapCard />);
    expect(screen.getAllByText('Select NFTs')).toHaveLength(2);
  });

  it('opens NFT selection modal when clicking select button', () => {
    render(<SwapCard />);
    const selectButtons = screen.getAllByText('Select NFTs');
    fireEvent.click(selectButtons[0]);
    expect(screen.getByText('Select NFT')).toBeInTheDocument();
  });

  it('displays swap button when wallet is connected', () => {
    useWalletStore.mockImplementation(() => ({
      isConnected: true,
      address: '0x123...',
      connect: vi.fn(),
      disconnect: vi.fn(),
      error: null,
      isConnecting: false
    }));

    render(<SwapCard />);
    expect(screen.getByText('Create OTC Swap Order')).toBeInTheDocument();
  });
});