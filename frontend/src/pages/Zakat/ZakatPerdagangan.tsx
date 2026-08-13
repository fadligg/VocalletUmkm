import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function ZakatPerdagangan() {
  const navigate = useNavigate();
  const [asetLancar, setAsetLancar] = useState<number | ''>('');
  const [piutang, setPiutang] = useState<number | ''>('');
  const [utang, setUtang] = useState<number | ''>('');
  const [hargaEmas, setHargaEmas] = useState<number>(1450000);

  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        const response = await fetch('https://menu.co-id.id/vocallet/api/gold-prices');
        const data = await response.json();
        const goldPrice = data.gold || data.data?.gold;
        if (goldPrice) setHargaEmas(goldPrice);
      } catch (error) {
        console.error('Error fetching gold price:', error);
      }
    };
    fetchGoldPrice();
  }, []);

  const formatRp = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateZakat = () => {
    const totalAset = Number(asetLancar || 0) + Number(piutang || 0) - Number(utang || 0);
    const nishab = 85 * hargaEmas;
    
    if (totalAset >= nishab) {
      return totalAset * 0.025;
    }
    return 0;
  };

  const totalZakat = calculateZakat();
  const totalHarta = Number(asetLancar || 0) + Number(piutang || 0) - Number(utang || 0);
  const nishab = 85 * hargaEmas;

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 antialiased flex flex-col">
      <div className="px-4 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900 transition-colors">
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          <span className="font-semibold text-sm">Kembali</span>
        </button>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kalkulator Zakat Perdagangan</h1>
      </div>

      <main className="flex-grow w-full max-w-[375px] mx-auto p-4 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Aset Lancar (Kas + Persediaan)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
              <input 
                type="number"
                value={asetLancar}
                onChange={(e) => setAsetLancar(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Piutang Lancar</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
              <input 
                type="number"
                value={piutang}
                onChange={(e) => setPiutang(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Utang Jatuh Tempo</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
              <input 
                type="number"
                value={utang}
                onChange={(e) => setUtang(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
              />
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 shadow-md flex flex-col relative overflow-hidden transition-colors ${totalHarta >= nishab ? 'bg-[#008A43] text-white' : 'bg-slate-200 text-slate-500'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon icon="mdi:storefront" className="w-24 h-24" />
          </div>
          <span className="text-sm font-bold opacity-90 relative z-10">Status Zakat</span>
          <span className="text-xl font-extrabold mt-1 relative z-10">
            {totalHarta >= nishab ? 'Wajib Zakat' : 'Belum Wajib Zakat'}
          </span>
          {totalHarta >= nishab && (
            <div className="mt-4 relative z-10">
              <span className="text-sm font-semibold opacity-90 block">Zakat yang harus dibayar:</span>
              <span className="text-3xl font-extrabold">{formatRp(totalZakat)}</span>
            </div>
          )}
          <span className="text-xs opacity-75 mt-3 relative z-10 block">
            *Nishab: 85 gram Emas ({formatRp(nishab)})
          </span>
        </div>
      </main>
    </div>
  );
}
