import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineFallback({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-[9999] fixed inset-0">
        <div className="bg-white p-8 rounded-3xl shadow-lg flex flex-col items-center max-w-sm w-full">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
            <WifiOff size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Koneksi Terputus</h2>
          <p className="text-slate-600 mb-6">
            Aplikasi membutuhkan koneksi internet untuk beroperasi. Silakan periksa jaringan WiFi atau data seluler Anda.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#0b7b3f] text-white py-3 rounded-xl font-semibold hover:bg-[#006B2C] transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
