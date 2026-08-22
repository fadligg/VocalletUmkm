import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function ZakatMaal() {
  const navigate = useNavigate();
  const [uangTunai, setUangTunai] = useState<number | ''>('');
  const [nilaiEmas, setNilaiEmas] = useState<number | ''>('');
  const [asetLain, setAsetLain] = useState<number | ''>('');
  const [hargaEmas, setHargaEmas] = useState<number>(1450000);
  
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [labaBersih, setLabaBersih] = useState<number>(0);
  const [isLoadingLaba, setIsLoadingLaba] = useState<boolean>(false);

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

  useEffect(() => {
    if (isAuto && labaBersih === 0) {
      setIsLoadingLaba(true);
      const token = localStorage.getItem('vocallet_token');
      fetch('http://localhost:5001/api/business', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.stats) {
          setLabaBersih(data.stats.labaBersih || 0);
        }
      })
      .catch(err => console.error("Error fetching laba bersih:", err))
      .finally(() => setIsLoadingLaba(false));
    }
  }, [isAuto, labaBersih]);

  const totalHarta = isAuto 
    ? labaBersih 
    : Number(uangTunai || 0) + Number(nilaiEmas || 0) + Number(asetLain || 0);
  const nishab = 85 * hargaEmas;

  const calculateZakat = () => {
    if (totalHarta >= nishab) {
      return totalHarta * 0.025;
    }
    return 0;
  };

  const totalZakat = calculateZakat();

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 antialiased flex flex-col">
      <div className="px-4 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900 transition-colors">
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          <span className="font-semibold text-sm">Kembali</span>
        </button>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Kalkulator Zakat Maal</h1>
      </div>

      <main className="flex-grow w-full max-w-[375px] mx-auto p-4 flex flex-col gap-6">
        {/* Toggle Mode */}
        <div className="bg-slate-200/70 p-1 rounded-xl flex items-center relative">
          <button 
            onClick={() => setIsAuto(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all z-10 ${!isAuto ? 'bg-white text-[#008A43] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Hitung Manual
          </button>
          <button 
            onClick={() => setIsAuto(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all z-10 ${isAuto ? 'bg-white text-[#008A43] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Hitung Otomatis
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          {!isAuto ? (
            <>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Uang Tunai / Tabungan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
              <input 
                type="number"
                value={uangTunai}
                onChange={(e) => setUangTunai(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nilai Logam Mulia (Emas/Perak)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
              <input 
                type="number"
                value={nilaiEmas}
                onChange={(e) => setNilaiEmas(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Aset Investasi Lainnya</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
              <input 
                type="number"
                value={asetLain}
                onChange={(e) => setAsetLain(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#008A43]"
              />
            </div>
          </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Icon icon="mdi:chart-line" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Total Laba Bersih</h3>
                  <p className="text-xs text-slate-500 font-medium">Diambil dari pencatatan keuangan</p>
                </div>
              </div>
              
              {isLoadingLaba ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span>
                  <span className="text-sm font-bold text-slate-500">Memuat data...</span>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-2xl font-extrabold text-slate-800">{formatRp(labaBersih)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`rounded-2xl p-5 shadow-md flex flex-col relative overflow-hidden transition-colors ${totalHarta >= nishab ? 'bg-[#008A43] text-white' : 'bg-slate-200 text-slate-500'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon icon="mdi:wallet-bifold" className="w-24 h-24" />
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
