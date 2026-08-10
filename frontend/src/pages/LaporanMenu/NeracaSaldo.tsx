import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function NeracaSaldo() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto font-sans relative pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Link 
          to="/laporan" 
          className="p-2 hover:bg-white/60 bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-xl transition-colors active:scale-95 text-slate-600 shadow-sm"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Neraca Saldo</h1>
      </div>
      
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] text-center">
        <p className="text-slate-500">Halaman Neraca Saldo</p>
      </div>
    </div>
  );
}
