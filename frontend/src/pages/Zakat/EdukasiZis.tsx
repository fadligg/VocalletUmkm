import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function EdukasiZis() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 antialiased flex flex-col">
      <div className="px-4 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900 transition-colors">
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          <span className="font-semibold text-sm">Kembali</span>
        </button>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Edukasi Z.I.S</h1>
      </div>

      <main className="flex-grow w-full max-w-[375px] mx-auto p-4 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:scale-balance" className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Apa itu Zakat?</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Zakat secara bahasa berarti 'suci', 'berkembang', atau 'berkah'. Secara istilah, Zakat adalah harta tertentu yang wajib dikeluarkan oleh umat muslim untuk diberikan kepada golongan yang berhak menerimanya (asnaf) sesuai dengan ketentuan syariat.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:hand-heart" className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Infaq</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Infaq adalah mengeluarkan sebagian dari harta atau pendapatan/penghasilan untuk suatu kepentingan yang diperintahkan dalam ajaran Islam. Infaq tidak mengenal nishab (batas harta) dan bisa dikeluarkan kapan saja.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:gift-outline" className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Shodaqoh (Sedekah)</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sedekah maknanya lebih luas dari zakat dan infaq. Sedekah tidak hanya berupa harta benda (uang, makanan), tetapi juga bisa berupa amal perbuatan baik seperti senyuman, menyingkirkan duri dari jalan, atau mengajarkan ilmu.
          </p>
        </div>
      </main>
    </div>
  );
}
