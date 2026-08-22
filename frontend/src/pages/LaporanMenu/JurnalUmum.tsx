import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { exportToExcel } from '../../tools/exportExcel';
import { exportToPdf } from '../../tools/exportPdf';

export default function JurnalUmum() {
  const navigate = useNavigate();
  const [selectedPeriode, setSelectedPeriode] = useState('Tahun ini');
  const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [jurnalData, setJurnalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const PERIODE_LIST = ['Bulan ini', 'Bulan lalu', 'Tahun ini', 'Kustom'];

  useEffect(() => {
    const fetchJurnal = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        let url = 'http://localhost:5001/api/laporan/jurnalumum';
        if (selectedPeriode === 'Kustom' && startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else if (selectedPeriode !== 'Kustom') {
          url += `?periode=${selectedPeriode}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJurnalData(res.data);
      } catch (error) {
        console.error('Error fetching jurnal umum:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if not custom, or if custom and both dates are selected
    if (selectedPeriode !== 'Kustom' || (selectedPeriode === 'Kustom' && startDate && endDate)) {
      setLoading(true);
      fetchJurnal();
    }
  }, [navigate, selectedPeriode, startDate, endDate]);

  const handleExportExcel = () => {
    exportToExcel(jurnalData, 'Jurnal_Umum.xlsx');
  };

  const handleExportPdf = () => {
    exportToPdf(jurnalData, 'Jurnal_Umum.pdf');
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto font-sans relative pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link 
            to="/laporan" 
            className="p-2 hover:bg-white/60 bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-xl transition-colors active:scale-95 text-slate-600 shadow-sm"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Jurnal Umum</h1>
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
          
          {selectedPeriode === 'Kustom' && (
            <div className="flex flex-col sm:flex-row gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-semibold">Memuat Jurnal Umum...</div>
        ) : (
          <div className="overflow-x-auto">
            {jurnalData.map(jurnal => (
              <div key={jurnal.id} className="p-4 sm:p-5 border-b border-slate-100 last:border-0">
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-5 gap-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                    {jurnal.date} &middot; {jurnal.ref}
                  </h3>
                  <span className="text-sm text-slate-500 text-right max-w-[120px] sm:max-w-none leading-snug">
                    {jurnal.description}
                  </span>
                </div>
                
                {/* Entries */}
                <div className="space-y-4">
                  {jurnal.entries.map((entry, idx) => (
                    <div key={idx} className="grid grid-cols-[40px_1fr_1fr_1fr] sm:grid-cols-[60px_1fr_1fr_1fr] gap-2 items-center text-sm">
                      
                      {/* Account Info */}
                      <span className="text-slate-400 text-xs sm:text-sm">{entry.accountCode}</span>
                      <span className="text-slate-700 font-medium truncate pr-2">{entry.accountName}</span>
                      
                      {/* Debit */}
                      <div className="flex flex-col items-center justify-center">
                        {entry.debit > 0 && (
                          <>
                            <span className="text-[10px] sm:text-xs text-slate-800 font-medium">Rp</span>
                            <span className="font-semibold text-slate-800 tracking-tight">{entry.debit.toLocaleString('id-ID')}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Credit */}
                      <div className="flex flex-col items-end justify-center">
                        {entry.credit > 0 && (
                          <>
                            <span className="text-[10px] sm:text-xs text-slate-800 font-medium">Rp</span>
                            <span className="font-semibold text-slate-800 tracking-tight">{entry.credit.toLocaleString('id-ID')}</span>
                          </>
                        )}
                      </div>
                      
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <hr className="border-slate-200/60 my-4" />

                {/* Footer */}
                <div className="flex justify-end gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 font-medium">
                  <span>Debit: Rp {jurnal.totalDebit.toLocaleString('id-ID')}</span>
                  <span>Kredit: Rp {jurnal.totalCredit.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
