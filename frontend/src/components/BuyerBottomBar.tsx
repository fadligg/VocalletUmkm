import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function BuyerBottomBar() {
  const navItems = [
    { to: '/pedagang-sekitar', icon: 'mdi:map-marker-outline', activeIcon: 'mdi:map-marker', label: 'Sekitar' },
    { to: '/profil-pembeli', icon: 'mdi:account-outline', activeIcon: 'mdi:account', label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-blue-50 flex items-center justify-around px-4 z-50 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`relative flex items-center justify-center ${isActive ? 'bg-blue-50 p-1.5 rounded-2xl' : 'p-1.5'}`}>
                <Icon icon={isActive ? item.activeIcon : item.icon} className="w-6 h-6" />
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
