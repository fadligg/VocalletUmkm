import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function ZakatFitrah() {
  const navigate = useNavigate();
  const [jumlahJiwa, setJumlahJiwa] = useState<number | ''>('');
  const [hargaBeras, setHargaBeras] = useState<number>(16500);

  const formatRp = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateZakat = () => {
    if (!jumlahJiwa) return 0;
    return Number(jumlahJiwa) * 2.5 * hargaBeras;
  };

  const totalZakat = calculateZakat();

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 antialiased flex flex-col">
      <div className="px-4 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900 transition-colors">
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          <span className="font-semibold text-sm">Kembali</span>
        </button>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kalkulator Zakat Fitrah</h1>
      </div>

      <main className="flex-grow w-full max-w-[375px] mx-auto p-4 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Jumlah Jiwa (Orang)</label>
            <input 
              type="number"
              value={jumlahJiwa}
              onChange={(e) => setJumlahJiwa(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Harga Beras per Kg</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
              <input 
                type="number"
                value={hargaBeras}
                onChange={(e) => setHargaBeras(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">*Default menggunakan harga Rp16.500/kg</p>
          </div>
        </div>

        <div className="bg-[#008A43] text-white rounded-2xl p-5 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon icon="mdi:hand-heart" className="w-24 h-24" />
          </div>
          <span className="text-sm font-bold opacity-90 relative z-10">Total Zakat Fitrah</span>
          <span className="text-3xl font-extrabold mt-1 relative z-10">{formatRp(totalZakat)}</span>
          <span className="text-xs opacity-75 mt-1 relative z-10">Total Beras: {Number(jumlahJiwa || 0) * 2.5} Kg</span>
        </div>
      </main>
    </div>
  );
}
