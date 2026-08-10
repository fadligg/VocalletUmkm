import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

export default function Profil() {
  const navigate = useNavigate();
  
  // State for form fields based on the screenshot
  const [nama, setNama] = useState('kaju 23');
  const [jenis, setJenis] = useState('Dagang');
  const [telepon, setTelepon] = useState('sasasafasaf');
  const [pajak, setPajak] = useState('0');
  const [alamat, setAlamat] = useState('98989');
  const [tanggalMulai, setTanggalMulai] = useState('2026-01-01');
  const [tanggalAkhir, setTanggalAkhir] = useState('2026-12-31');
  const [stokNegatif, setStokNegatif] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('vocallet_token');
    localStorage.removeItem('vocallet_user_mode');
    localStorage.removeItem('vocallet_user_email');
    navigate('/login-umkm');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 px-4 antialiased">
      <h1 className="text-2xl font-extrabold text-[#0F2942] mb-4">Pengaturan Usaha</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-6 mb-6">
        {/* Profile Picture Upload */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#0b7b3f] text-white rounded-full flex items-center justify-center text-xl font-bold">
            K
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 mb-1.5">Foto Profil / Logo Usaha</p>
            <button className="flex items-center gap-1.5 bg-[#0b7b3f] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#096634] transition-colors">
              <Icon icon="mdi:camera-outline" className="w-4 h-4" />
              Upload Foto
            </button>
          </div>
        </div>

        <form className="flex flex-col space-y-4">
          {/* Nama Usaha */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nama Usaha</label>
            <input 
              type="text" 
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
            />
          </div>

          {/* Jenis Usaha */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Jenis Usaha</label>
            <select 
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f] bg-white"
            >
              <option value="Dagang">Dagang</option>
              <option value="Jasa">Jasa</option>
              <option value="Dagang+Jasa">Dagang + Jasa</option>
            </select>
          </div>

          {/* Telepon & Pajak */}
          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Telepon</label>
              <input 
                type="text" 
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Tarif Pajak (%)</label>
              <input 
                type="number" 
                value={pajak}
                onChange={(e) => setPajak(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Alamat</label>
            <input 
              type="text" 
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
            />
          </div>

          {/* Tanggal Buku */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">Tanggal Mulai Tahun Buku</label>
              <input 
                type="date" 
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">Tanggal Akhir Tahun Buku</label>
              <input 
                type="date" 
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
          </div>

          {/* Izinkan stok negatif */}
          <div className="flex items-center pt-2">
            <input 
              type="checkbox" 
              id="stokNegatif"
              checked={stokNegatif}
              onChange={(e) => setStokNegatif(e.target.checked)}
              className="w-4 h-4 text-[#0b7b3f] border-slate-300 rounded focus:ring-[#0b7b3f] accent-[#0b7b3f] cursor-pointer"
            />
            <label htmlFor="stokNegatif" className="ml-2 text-sm text-slate-700 cursor-pointer">
              Izinkan stok negatif
            </label>
          </div>

          <button 
            type="button" 
            className="w-full bg-[#0b7b3f] hover:bg-[#096634] text-white font-bold py-3 mt-2 rounded-lg transition-colors focus:outline-none"
          >
            Simpan Pengaturan
          </button>
        </form>
      </div>

      {/* Logout Card */}
      <div 
        onClick={handleLogout}
        className="bg-white rounded-xl shadow-sm border border-red-100 p-4 flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors mb-4"
      >
        <div className="flex items-center gap-3 text-red-600 font-bold">
          <Icon icon="mdi:logout" className="w-5 h-5" />
          Keluar
        </div>
        <Icon icon="mdi:chevron-right" className="w-5 h-5 text-red-400" />
      </div>
    </div>
  );
}
