import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function Sidebar() {
  const navigate = useNavigate();

  const navItems = [
    { to: '/home', icon: 'mdi:home-outline', activeIcon: 'mdi:home', label: 'Home' },
    { to: '/transaksi', icon: 'mdi:receipt-text-outline', activeIcon: 'mdi:receipt-text', label: 'Transaksi' },
    { to: '/pelanggan-sekitar', icon: 'mdi:map-marker-radius-outline', activeIcon: 'mdi:map-marker-radius', label: 'Pelanggan Sekitar' },
    { to: '/stok', icon: 'mdi:package-variant-closed', activeIcon: 'mdi:package-variant', label: 'Stok' },
    { to: '/laporan', icon: 'mdi:chart-bar', activeIcon: 'mdi:chart-bar', label: 'Laporan' },
    { to: '/profil', icon: 'mdi:account-outline', activeIcon: 'mdi:account', label: 'Profil' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('vocallet_token');
    navigate('/login-umkm');
  };

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-100 hidden sm:flex flex-col py-6 px-4 z-40 overflow-y-auto">
      <div className="flex flex-col space-y-2 flex-grow">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-green-50 text-[#0b7b3f] font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  icon={isActive ? item.activeIcon : item.icon}
                  className={`w-6 h-6 ${isActive ? 'text-[#0b7b3f]' : 'text-slate-400'}`}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 hover:text-red-700 font-medium"
        >
          <Icon icon="mdi:logout" className="w-6 h-6" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
