import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const menuLaporan = [
  {
    path: '/laporan/jurnal-umum',
    title: 'Jurnal Umum',
    description: 'Daftar semua jurnal transaksi',
    icon: 'lucide:book-open',
  },
  {
    path: '/laporan/buku-besar',
    title: 'Buku Besar',
    description: 'Mutasi per akun',
    icon: 'lucide:list',
  },
  {
    path: '/laporan/neraca-saldo',
    title: 'Neraca Saldo',
    description: 'Saldo akhir semua akun',
    icon: 'lucide:scale',
  },
  {
    path: '/laporan/laba-rugi',
    title: 'Laporan Laba Rugi',
    description: 'Perhitungan laba/rugi',
    icon: 'lucide:file-text',
  },
  {
    path: '/laporan/neraca',
    title: 'Neraca',
    description: 'Posisi keuangan (Aktiva & Pasiva)',
    icon: 'lucide:clipboard-list',
  },
];

export default function Laporan() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto font-sans relative pb-24">
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-6">Laporan</h1>
      
      <div className="flex flex-col gap-3 sm:gap-4">
        {menuLaporan.map((item, index) => (
          <Link 
            key={index}
            to={item.path}
            className="group bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgb(0,0,0,0.02)] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-[0_4px_24px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          >
            {/* Icon Box */}
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#e6f4ea] rounded-xl flex items-center justify-center text-[#107c41] transition-colors group-hover:bg-[#107c41] group-hover:text-white">
              <Icon icon={item.icon} className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            
            {/* Text Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
