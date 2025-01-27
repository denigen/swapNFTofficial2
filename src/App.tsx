import React, { useState } from 'react';
import Header from './components/Header/Header';
import SwapCard from './components/SwapCard/SwapCard';
import OrdersTab from './components/Orders/OrdersTab';
import InfoSection from './components/InfoSection/InfoSection';
import Footer from './components/Footer/Footer';

type Tab = 'swap' | 'orders';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('swap');

  return (
    <div className="min-h-screen bg-bg font-pixel text-primary retro-container">
      <div className="scanlines" />
      <div className="crt-effect">
        <Header />
        
        <div className="w-full max-w-7xl mx-auto mb-8 px-4">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('swap')}
              className={`retro-button pixel-corners ${
                activeTab === 'swap'
                  ? 'bg-primary text-bg'
                  : 'bg-button text-primary hover:bg-button-hover'
              }`}
            >
              Create Swap
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`retro-button pixel-corners ${
                activeTab === 'orders'
                  ? 'bg-primary text-bg'
                  : 'bg-button text-primary hover:bg-button-hover'
              }`}
            >
              Orders
            </button>
          </div>
        </div>

        <main className="w-full max-w-7xl mx-auto flex flex-col items-center px-4">
          {activeTab === 'swap' && (
            <>
              <SwapCard />
              <InfoSection />
            </>
          )}
          {activeTab === 'orders' && <OrdersTab />}
        </main>

        <Footer />
      </div>
    </div>
  );
}