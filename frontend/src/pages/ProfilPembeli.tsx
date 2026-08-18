import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function ProfilPembeli() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    document.title = 'Profil Pembeli | Vocallet';
    const savedEmail = localStorage.getItem('vocallet_user_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vocallet_token');
    localStorage.removeItem('vocallet_user_mode');
    localStorage.removeItem('vocallet_user_email');
    navigate('/pilihan-peran');
  };

  return (
    <div className="bg-[#f0f7ff] min-h-screen pt-8 px-4 sm:px-6 antialiased flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-blue-900 mb-8 text-center">Pengaturan Profil</h1>
        
        <div className="bg-white rounded-3xl shadow-sm border border-blue-50 p-6 mb-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-black mb-4 shadow-md shadow-blue-500/20">
            {email ? email.charAt(0).toUpperCase() : 'P'}
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center truncate w-full">{email || 'Pembeli Anonim'}</h2>
          <p className="text-sm font-semibold text-blue-600 mt-1 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
            Akun Pribadi
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon icon="mdi:bell-outline" className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">Notifikasi</h3>
              <p className="text-xs text-gray-500">Atur pemberitahuan aplikasi</p>
            </div>
            <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon icon="mdi:shield-check-outline" className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">Keamanan</h3>
              <p className="text-xs text-gray-500">Kata sandi dan privasi</p>
            </div>
            <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
          </div>

          <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon icon="mdi:help-circle-outline" className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-sm">Pusat Bantuan</h3>
              <p className="text-xs text-gray-500">FAQ dan kontak dukungan</p>
            </div>
            <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm border border-red-100 p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-red-50 transition-all active:scale-95 group text-red-600 font-bold"
        >
          <Icon icon="mdi:logout" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
