import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoVocallet from '../assets/logo-vocallet.png';

const PilihanPeran: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Pilih Peran | Vocallet';
  }, []);

  return (
    <div className="min-h-screen bg-[#f4fbf7] flex flex-col items-center justify-center p-6 relative antialiased w-full">
      <header className="w-full py-4 px-6 flex items-center justify-center absolute top-0 left-0">
        <div className="absolute inset-x-0 top-0 py-4 flex justify-center pointer-events-none">
          <span className="font-extrabold text-lg md:text-xl text-brand-primary tracking-wide">
            Vocallet
          </span>
        </div>
      </header>

      <div className="w-full max-w-md flex flex-col items-center mt-12 mb-16 z-10">
        <div className="w-20 h-20 bg-white rounded-2xl border border-green-100 shadow-sm flex items-center justify-center p-2 mb-6">
          <img src={logoVocallet} alt="Vocallet" className="w-full h-full object-contain rounded-xl" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-2">Pilih Peran Anda</h1>
        <p className="text-gray-500 text-center mb-10">
          Silakan pilih peran untuk melanjutkan ke dalam aplikasi.
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={() => navigate('/login-pembeli')}
            className="w-full flex items-center p-5 bg-white border-2 border-transparent hover:border-brand-primary rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-brand-primary transition-colors">Sebagai Pembeli</h2>
              <p className="text-xs text-gray-500 mt-1">Belanja dan kelola keuangan pribadi.</p>
            </div>
            <div className="ml-auto text-gray-400 group-hover:text-brand-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => navigate('/login-umkm')}
            className="w-full flex items-center p-5 bg-white border-2 border-transparent hover:border-brand-primary rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-green-50 text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <div className="ml-4 text-left">
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-brand-primary transition-colors">Sebagai Penjual (UMKM)</h2>
              <p className="text-xs text-gray-500 mt-1">Kelola toko dan keuangan bisnis Anda.</p>
            </div>
            <div className="ml-auto text-gray-400 group-hover:text-brand-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PilihanPeran;
