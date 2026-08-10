import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomBar from '../components/BottomBar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Main content area - Add padding top for navbar and padding bottom for bottom bar on mobile */}
      <main className="flex-1 pt-16 pb-16 sm:pb-0">
        <div className="max-w-7xl mx-auto w-full h-full">
          <Outlet />
        </div>
      </main>

      <BottomBar />
    </div>
  );
}
