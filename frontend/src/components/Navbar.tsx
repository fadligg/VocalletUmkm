// import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 z-50">
      <Link to="/home" className="flex items-center">
        {/* Removed icon to match image which only has text "Vocallet" */}
        <span className="font-bold text-xl text-[#0b7b3f]">Vocallet</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {/* Moon icon for dark mode */}
        <button className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
          <Icon icon="mdi:moon-waning-crescent" className="w-6 h-6" />
        </button>
        {/* User Avatar with 'F' */}
        <Link to="/profil" className="cursor-pointer">
          <div className="w-9 h-9 bg-[#0b7b3f] rounded-full flex items-center justify-center text-white font-semibold">
            F
          </div>
        </Link>
      </div>
    </nav>
  );
}
