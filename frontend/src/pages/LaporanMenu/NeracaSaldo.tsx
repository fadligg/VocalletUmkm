import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { exportToExcel } from '../../tools/exportExcel';
import { exportToPdf } from '../../tools/exportPdf';

const PERIODE_LIST = ['Bulan ini', 'Bulan lalu', 'Tahun ini', 'Tahun lalu'];

export default function NeracaSaldo() {
  const navigate = useNavigate();
  const [selectedPeriode, setSelectedPeriode] = useState('Tahun ini');
  const [isPeriodeOpen, setIsPeriodeOpen] = useState(false);
  const [neracaSaldoData, setNeracaSaldoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeracaSaldo = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5001/api/laporan/neracasaldo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNeracaSaldoData(res.data);
      } catch (error) {
        console.error('Error fetching neraca saldo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNeracaSaldo();
  }, [navigate]);

  const handleExportExcel = () => {
    exportToExcel(neracaSaldoData, `Neraca_Saldo_${selectedPeriode}.xlsx`);
  };

  const handleExportPdf = () => {
    exportToPdf(neracaSaldoData, `Neraca_Saldo_${selectedPeriode}.pdf`);
  };

  const totalDebit = neracaSaldoData.reduce((acc, curr) => acc + curr.debit, 0);
  const totalCredit = neracaSaldoData.reduce((acc, curr) => acc + curr.credit, 0);
  const isSeimbang = totalDebit === totalCredit;

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-semibold mt-20">Memuat Neraca Saldo...</div>;
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Neraca Saldo</h1>
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
          <p className="text-sm text-slate-400 font-medium">31 Desember 2025 - 30 Desember 2026</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-4">
        {isSeimbang ? (
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
            <Icon icon="lucide:check-circle-2" className="w-6 h-6" />
            <span>Neraca saldo seimbang</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
            <Icon icon="lucide:alert-circle" className="w-6 h-6" />
            <span>Neraca saldo TIDAK seimbang!</span>
          </div>
        )}
      </div>
      
      {/* Table Section */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200/60 bg-white/40">
                <th className="py-4 px-4 font-bold text-slate-700 text-sm whitespace-nowrap w-20">Kode</th>
                <th className="py-4 px-4 font-bold text-slate-700 text-sm whitespace-nowrap">
                  Nama<br />Akun
                </th>
                <th className="py-4 px-6 font-bold text-slate-700 text-sm text-right whitespace-nowrap">Debit</th>
                <th className="py-4 px-6 font-bold text-slate-700 text-sm text-right whitespace-nowrap">Kredit</th>
              </tr>
            </thead>
            <tbody>
              {neracaSaldoData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100/50 hover:bg-white/40 transition-colors">
                  <td className="py-4 px-4 text-sm text-slate-400 font-medium whitespace-nowrap">{row.kode}</td>
                  <td className="py-4 px-4 text-sm text-slate-700 whitespace-nowrap">
                    {row.nama.split(' ').map((str, i) => (
                      <React.Fragment key={i}>{str}<br className="sm:hidden"/></React.Fragment>
                    ))}
                  </td>
                  <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                    {row.debit > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] text-slate-800 font-medium">Rp</span>
                        <span className="font-semibold text-slate-800 tracking-tight text-[15px]">{row.debit.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                    {row.credit > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] text-slate-800 font-medium">Rp</span>
                        <span className="font-semibold text-slate-800 tracking-tight text-[15px]">{row.credit.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer Row for Total */}
            <tfoot>
              <tr className="bg-slate-50/50">
                <td colSpan={2} className="py-4 px-4 text-sm font-extrabold text-slate-800 text-right">TOTAL</td>
                <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] text-emerald-700 font-bold">Rp</span>
                    <span className="font-extrabold text-emerald-700 tracking-tight text-[15px]">{totalDebit.toLocaleString('id-ID')}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-right whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] text-emerald-700 font-bold">Rp</span>
                    <span className="font-extrabold text-emerald-700 tracking-tight text-[15px]">{totalCredit.toLocaleString('id-ID')}</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
