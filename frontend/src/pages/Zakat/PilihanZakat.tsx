import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function PilihanZakat() {
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLElement>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [marketPrices, setMarketPrices] = useState<{ gold: number; silver: number } | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      try {
        const response = await fetch('https://menu.co-id.id/vocallet/api/gold-prices');
        const data = await response.json();
        setMarketPrices({
          gold: data.gold || data.data?.gold || 1450000,
          silver: data.silver || data.data?.silver || 16500
        });
      } catch (error) {
        console.error('Error fetching market prices:', error);
        // Fallback if API fails
        setMarketPrices({ gold: 1450000, silver: 16500 });
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPrices();
  }, []);

  const formatRp = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleZakatClick = (id: string, title: string) => {
    navigate(`/pilihan-zakat/${id}`);
  };

  const zakatTypes = [
    {
      id: 'fitrah',
      title: 'Zakat Fitrah',
      description: 'Zakat wajib bagi setiap muslim pada bulan Ramadhan',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: <Icon icon="mdi:hand-heart-outline" className="w-6 h-6" />
    },
    {
      id: 'maal',
      title: 'Zakat Maal (Harta)',
      description: 'Zakat atas harta kekayaan, emas, perak, dan tabungan',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: <Icon icon="mdi:wallet-bifold-outline" className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 antialiased flex flex-col">
      {/* Header section can be added here if needed */}
      <div className="px-4 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900 transition-colors">
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          <span className="font-semibold text-sm">Kembali</span>
        </button>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pilihan Zakat</h1>
      </div>

      <main 
        id="main-content" 
        ref={mainContentRef}
        className="flex-grow w-full max-w-[375px] mx-auto p-4 flex flex-col gap-6"
      >
        {/* Nishab Reference Card */}
        <div 
          tabIndex={0}
          className="bg-[#008A43] text-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 focus:outline-none outline-none"
          aria-label="Referensi Nishab: Emas 85 gram, Perak 595 gram, Rasio 2.5 persen"
        >
          <div className="flex items-center gap-2">
            <Icon icon="mdi:scale-balance" className="w-5 h-5" />
            <span className="font-extrabold text-sm tracking-wide">Referensi Nishab</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Emas */}
            <div className="bg-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-green-100 uppercase">Emas</span>
              <span className="text-sm font-extrabold text-white">85g</span>
            </div>
            {/* Perak */}
            <div className="bg-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-green-100 uppercase">Perak</span>
              <span className="text-sm font-extrabold text-white">595g</span>
            </div>
            {/* Rasio */}
            <div className="bg-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-green-100 uppercase">Rasio</span>
              <span className="text-sm font-extrabold text-white">2.5%</span>
            </div>
          </div>
        </div>

        {/* Real-time Market Prices */}
        <div 
          tabIndex={0}
          className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex flex-col gap-3 focus:outline-none outline-none"
          aria-label="Harga Pasar Real Time: Emas per gram Rp 65.40, Perak per gram Rp 0.75"
        >
          <div className="flex items-center gap-2">
            <Icon icon="mdi:trending-up" className="w-5 h-5 text-gray-700" />
            <span className="font-extrabold text-xs text-gray-700 tracking-wide">Harga Pasar Real-Time</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Emas Price */}
            <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase">Emas <span className="lowercase text-[9px] font-normal text-gray-400">/gram</span></span>
              <span className="text-xs font-extrabold text-[#008A43]">
                {isLoadingPrices ? 'Memuat...' : (marketPrices ? formatRp(marketPrices.gold) : 'Rp 1.450.000')}
              </span>
            </div>
            {/* Perak Price */}
            <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase">Perak <span className="lowercase text-[9px] font-normal text-gray-400">/gram</span></span>
              <span className="text-xs font-extrabold text-[#008A43]">
                {isLoadingPrices ? 'Memuat...' : (marketPrices ? formatRp(marketPrices.silver) : 'Rp 16.500')}
              </span>
            </div>
          </div>
        </div>

        {/* Pilih Tipe Zakat Selection */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-extrabold text-gray-800 tracking-wide px-1">
            Pilih Tipe Zakat
          </h2>

          <div className="flex flex-col gap-3">
            {zakatTypes.map((zType) => (
              <button
                key={zType.id}
                onClick={() => handleZakatClick(zType.id, zType.title)}
                className="w-full bg-white border border-slate-100 hover:bg-gray-50/50 rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm transition-all focus:outline-none outline-none"
                aria-label={`${zType.title}. ${zType.description}. Ketuk untuk menghitung.`}
              >
                <div className={`w-10 h-10 ${zType.iconBg} ${zType.iconColor} rounded-xl flex items-center justify-center flex-shrink-0 border border-green-700/10`}>
                  {zType.icon}
                </div>
                <div className="flex-grow">
                  <h3 className="text-sm font-extrabold text-gray-800 tracking-tight leading-tight">
                    {zType.title}
                  </h3>
                  <p className="text-[10px] font-semibold text-gray-400 leading-snug mt-0.5">
                    {zType.description}
                  </p>
                </div>
              </button>
            ))}

            {/* Info Zakat & Edukasi Card */}
            <button
              onClick={() => handleZakatClick('edukasi', 'Edukasi Zakat, Infaq, Shodaqoh')}
              className="w-full bg-white border border-slate-100 hover:bg-gray-50/50 rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm transition-all focus:outline-none outline-none"
              aria-label="Edukasi Zakat, Infaq, Shodaqoh. Pelajari lebih lanjut tentang Zakat Infaq dan Shodaqoh. Ketuk untuk membuka."
            >
              <div className="w-10 h-10 bg-slate-100 text-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                <Icon icon="mdi:lightbulb-on-outline" className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-extrabold text-gray-800 tracking-tight leading-tight">
                  Edukasi Zakat, Infaq, Shodaqoh
                </h3>
                <p className="text-[10px] font-semibold text-gray-400 leading-snug mt-0.5">
                  Pelajari lebih lanjut cara menghitung zakat dan arti zakat.
                </p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
