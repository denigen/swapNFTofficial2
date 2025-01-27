import React from 'react';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import WalletButton from '../WalletButton/WalletButton';

export default function Header() {
  return (
    <header className="w-full max-w-7xl flex justify-between items-center mb-12 px-4 pt-8">
      <Logo />
      <div className="flex items-center space-x-6">
        <WalletButton />
        <ThemeToggle />
      </div>
    </header>
  );
}