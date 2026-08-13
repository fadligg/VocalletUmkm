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
  const [jurnalData, setJurnalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJurnal = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5001/api/laporan/jurnalumum', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJurnalData(res.data);
      } catch (error) {
        console.error('Error fetching jurnal umum:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJurnal();
  }, [navigate]);

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
      <div className="mb-6">
        <div className="relative inline-block mb-3">
          <select className="appearance-none bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl pl-4 pr-10 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm cursor-pointer">
            <option>Bulan ini</option>
            <option>Bulan lalu</option>
            <option>Tahun ini</option>
          </select>
          <Icon icon="lucide:chevron-down" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <p className="text-sm text-slate-500 font-medium">31 Juli 2026 - 30 Agustus 2026</p>
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
