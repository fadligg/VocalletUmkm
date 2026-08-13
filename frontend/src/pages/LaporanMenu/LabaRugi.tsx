import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { exportToExcel } from '../../tools/exportExcel';
import { exportToPdf } from '../../tools/exportPdf';

const PERIODE_LIST = ['Bulan ini', 'Bulan lalu', 'Tahun ini', 'Tahun lalu'];

export default function LabaRugi() {
  const navigate = useNavigate();
  const [selectedPeriode, setSelectedPeriode] = useState('Bulan ini');
  const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);

  const [dataLabaRugi, setDataLabaRugi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabaRugi = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5001/api/laporan/labarugi', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDataLabaRugi(res.data);
      } catch (error) {
        console.error('Error fetching laba rugi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabaRugi();
  }, [navigate]);

  const penjualan = dataLabaRugi?.penjualan || 0;
  const hpp = dataLabaRugi?.hpp || 0;
  const labaKotor = dataLabaRugi?.labaKotor || 0;
  const beban = dataLabaRugi?.beban || [];
  const totalBeban = dataLabaRugi?.totalBeban || 0;
  const labaBersih = dataLabaRugi?.labaBersih || 0;

  const handleExportExcel = () => {
    exportToExcel([], `Laba_Rugi_${selectedPeriode}.xlsx`);
  };

  const handleExportPdf = () => {
    exportToPdf([], `Laba_Rugi_${selectedPeriode}.pdf`);
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-semibold mt-20">Memuat Laba Rugi...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto font-sans relative pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link 
            to="/laporan" 
            className="p-2 hover:bg-white/60 bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-xl transition-colors active:scale-95 text-slate-600 shadow-sm"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Laporan Laba Rugi</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
          >
            <Icon icon="lucide:file-spreadsheet" className="w-4 h-4" /> 
            <span className="hidden sm:inline">Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <button 
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
          >
            <Icon icon="lucide:download" className="w-4 h-4" /> 
            <span className="hidden sm:inline">PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Custom Periode Dropdown */}
        <div className="relative z-20">
          <div className="relative mb-2 w-40">
            <button
              type="button"
              onClick={() => setIsPeriodeOpen(!isPeriodeOpen)}
              className="flex justify-between items-center w-full bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all hover:bg-white"
            >
              <span>{selectedPeriode}</span>
              <Icon 
                icon="lucide:chevron-down" 
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isPeriodeOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isPeriodeOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsPeriodeOpen(false)}
                ></div>
                <div className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-xl border border-white/80 rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] z-20 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    {PERIODE_LIST.map((periode) => (
                      <button
                        key={periode}
                        onClick={() => {
                          setSelectedPeriode(periode);
                          setIsPeriodeOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none ${
                          selectedPeriode === periode 
                            ? 'bg-emerald-50 text-emerald-700 font-bold' 
                            : 'text-slate-600 font-medium'
                        }`}
                      >
                        {periode}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-slate-400 font-medium">31 Juli 2026 - 30 Agustus 2026</p>
        </div>
      </div>

      {/* Laporan Laba Rugi Content */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] p-5 sm:p-7 overflow-hidden transition-all hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
        
        {/* Section: Pendapatan */}
        <div className="mb-2">
          <h3 className="font-bold text-slate-700 mb-2">Pendapatan</h3>
          <div className="flex justify-between items-center py-2 px-2 text-slate-500">
            <span className="pl-4">Penjualan</span>
            <div className="flex gap-2 items-center">
              <span className="text-[12px] font-medium">Rp</span>
              <span className="font-semibold text-slate-700 tracking-tight text-[15px]">{penjualan.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="flex justify-between items-center py-3 px-2 border-t border-b border-slate-200/60 mb-6 bg-slate-50/30">
          <span className="font-extrabold text-slate-800">Total Pendapatan</span>
          <div className="flex gap-2 items-center">
            <span className="text-[12px] font-bold text-slate-800">Rp</span>
            <span className="font-extrabold text-slate-800 tracking-tight text-[15px]">{penjualan.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Section: HPP */}
        <div className="flex justify-between items-center py-2 px-2 mb-2">
          <span className="font-extrabold text-slate-800">Pendapatan Penjualan Bersih</span>
          <div className="flex gap-2 items-center">
            <span className="text-[12px] font-bold text-slate-800">Rp</span>
            <span className="font-extrabold text-slate-800 tracking-tight text-[15px]">{penjualan.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-start py-2 px-2 text-slate-500 mb-2">
          <span className="pl-4 pr-4 leading-tight">(-) Harga Pokok Penjualan<br/>(HPP)</span>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-medium">Rp</span>
            <span className="font-semibold text-slate-700 tracking-tight text-[15px]">{hpp.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Laba Kotor */}
        <div className="flex justify-between items-center py-3 px-2 border-t border-b border-slate-200/60 mb-6 bg-slate-50/30">
          <span className="font-extrabold text-slate-800">Laba Kotor</span>
          <div className="flex gap-2 items-center">
            <span className="text-[12px] font-bold text-slate-800">Rp</span>
            <span className="font-extrabold text-slate-800 tracking-tight text-[15px]">{labaKotor.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Section: Biaya Operasional */}
        <div className="mb-2">
          <h3 className="font-bold text-slate-700 mb-2">Biaya Operasional</h3>
          {beban.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 px-2 text-slate-500">
              <span className="pl-4">{item.nama}</span>
              <div className="flex gap-2 items-center">
                <span className="text-[12px] font-medium">Rp</span>
                <span className="font-semibold text-slate-700 tracking-tight text-[15px]">{item.nominal.toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Biaya Operasional */}
        <div className="flex justify-between items-center py-3 px-2 border-t border-slate-200/60 mb-6">
          <span className="font-bold text-slate-700 pl-4">Total Biaya Operasional</span>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-medium text-slate-500">Rp</span>
            <span className="font-semibold text-slate-700 tracking-tight text-[15px]">{totalBeban.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="flex justify-between items-center py-4 px-3 border-t-2 border-emerald-500/20 bg-emerald-50/50 rounded-b-xl mt-4">
          <span className="font-black text-emerald-800 text-lg">Laba Bersih</span>
          <div className="flex gap-2 items-center">
            <span className="text-[13px] font-bold text-emerald-700 mt-1">Rp</span>
            <span className="font-black text-emerald-700 tracking-tight text-xl">{labaBersih.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
