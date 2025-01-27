import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WalletButton from '../components/WalletButton/WalletButton';
import { useWalletStore } from '../stores/useWalletStore';

vi.mock('../stores/useWalletStore');

describe('WalletButton', () => {
  beforeEach(() => {
    useWalletStore.mockImplementation(() => ({
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      error: null,
      isConnecting: false
    }));
  });

  it('renders connect button when wallet is not connected', () => {
    render(<WalletButton />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('shows connecting state', () => {
    useWalletStore.mockImplementation(() => ({
      isConnected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      error: null,
      isConnecting: true
    }));

    render(<WalletButton />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows wallet address when connected', () => {
    useWalletStore.mockImplementation(() => ({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890',
      connect: vi.fn(),
      disconnect: vi.fn(),
      error: null,
      isConnecting: false
    }));

    render(<WalletButton />);
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument();
  });

  it('calls connect function when clicked', () => {
    const connect = vi.fn();
    useWalletStore.mockImplementation(() => ({
      isConnected: false,
      connect,
      disconnect: vi.fn(),
      error: null,
      isConnecting: false
    }));

    render(<WalletButton />);
    fireEvent.click(screen.getByText('Connect Wallet'));
    expect(connect).toHaveBeenCalled();
  });
});