import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function BottomBar() {
  const navItems = [
    { to: '/home', icon: 'mdi:home-outline', activeIcon: 'mdi:home', label: 'Home' },
    { to: '/transaksi', icon: 'mdi:receipt-text-outline', activeIcon: 'mdi:receipt-text', label: 'Transaksi' },
    { to: '/stok', icon: 'mdi:package-variant-closed', activeIcon: 'mdi:package-variant', label: 'Stok' },
    { to: '/laporan', icon: 'mdi:chart-bar', activeIcon: 'mdi:chart-bar', label: 'Laporan' },
    { to: '/profil', icon: 'mdi:cog-outline', activeIcon: 'mdi:cog', label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] pb-safe sm:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              isActive ? 'text-[#0b7b3f]' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon icon={isActive ? item.activeIcon : item.icon} className="w-6 h-6" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
