import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  const [initial, setInitial] = useState('U');
  const [logoUrl, setLogoUrl] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5001/api/business', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const business = res.data.business;
        if (business) {
          if (business.namaUsaha) {
            setInitial(business.namaUsaha.charAt(0).toUpperCase());
          }
          if (business.logoUrl) {
            setLogoUrl(business.logoUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch business for navbar:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchBusiness();
  }, []);

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
        {/* User Avatar with dynamic initial or logo */}
        <Link to="/profil" className="cursor-pointer">
          <div className="w-9 h-9 bg-[#0b7b3f] rounded-full flex items-center justify-center text-white font-semibold overflow-hidden relative">
            {isFetching ? (
              <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-full" />
            ) : logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
}
