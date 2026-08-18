import React from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import BuyerBottomBar from '../components/BuyerBottomBar';

export default function BuyerLayout() {
  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col antialiased">
      <ScrollRestoration />
      
      {/* Main content area - Add padding bottom for bottom bar */}
      <main className="flex-1 pb-16">
        <div className="w-full h-full">
          <Outlet />
        </div>
      </main>

      <BuyerBottomBar />
    </div>
  );
}
