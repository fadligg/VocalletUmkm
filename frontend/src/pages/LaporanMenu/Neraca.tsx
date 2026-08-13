import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { exportToExcel } from '../../tools/exportExcel';
import { exportToPdf } from '../../tools/exportPdf';

export default function Neraca() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('2026-08-11');
  const [dataNeraca, setDataNeraca] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeraca = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5001/api/laporan/neraca', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDataNeraca(res.data);
      } catch (error) {
        console.error('Error fetching neraca:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNeraca();
  }, [navigate]);

  const aktivaLancar = [
    { nama: 'Kas', nominal: dataNeraca?.aktivaLancar?.kas || 0 },
    { nama: 'Bank', nominal: dataNeraca?.aktivaLancar?.bank || 0 },
    { nama: 'Piutang Usaha', nominal: dataNeraca?.aktivaLancar?.piutangUsaha || 0 },
    { nama: 'Persediaan', nominal: dataNeraca?.aktivaLancar?.persediaan || 0 },
  ];
  const totalAktivaLancar = aktivaLancar.reduce((s, i) => s + i.nominal, 0);

  const aktivaTetap = [
    { nama: 'Peralatan Usaha', nominal: dataNeraca?.aktivaTetap?.peralatanUsaha || 0 },
    { nama: 'Kendaraan', nominal: dataNeraca?.aktivaTetap?.kendaraan || 0 },
  ];
  const totalAktivaTetap = aktivaTetap.reduce((s, i) => s + i.nominal, 0);

  const totalAktiva = totalAktivaLancar + totalAktivaTetap;

  const kewajiban = [
    { nama: 'Utang Usaha', nominal: dataNeraca?.kewajiban?.utangUsaha || 0 },
    { nama: 'Utang Bank', nominal: dataNeraca?.kewajiban?.utangBank || 0 },
  ];
  const totalKewajiban = kewajiban.reduce((s, i) => s + i.nominal, 0);

  const modal = [
    { nama: 'Modal Pemilik', nominal: dataNeraca?.modal?.modalPemilik || 0 },
  ];
  const totalModal = modal.reduce((s, i) => s + i.nominal, 0);

  const totalPasiva = totalKewajiban + totalModal;

  const handleExportExcel = () => {
    exportToExcel([], `Neraca_${selectedDate}.xlsx`);
  };

  const handleExportPdf = () => {
    exportToPdf([], `Neraca_${selectedDate}.pdf`);
  };

  const renderRow = (nama: string, nominal: number, isBold: boolean = false) => (
    <div className={`flex justify-between items-center py-2 px-2 ${isBold ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
      <span className="pl-4">{nama}</span>
      <div className="flex justify-between items-center w-32">
        <span className={`text-[12px] ${isBold ? 'font-bold' : 'font-medium'}`}>Rp</span>
        <span className={`tracking-tight ${isBold ? 'text-[15px]' : 'font-semibold text-slate-700 text-[14px]'}`}>
          {nominal.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-10 text-center text-slate-500 font-semibold mt-20">Memuat Neraca...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto font-sans relative pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link 
            to="/laporan" 
            className="p-2 hover:bg-white/60 bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-xl transition-colors active:scale-95 text-slate-600 shadow-sm"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Neraca</h1>
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
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-500">Per tanggal:</label>
        <div className="relative">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="appearance-none bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm cursor-pointer" 
          />
        </div>
      </div>

      {/* Document Card */}
      <div className="bg-white/60 backdrop-blur-lg transform-gpu border border-white/80 rounded-[2rem] shadow-xl shadow-slate-200/20 p-4 sm:p-8 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/30 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">kaju 23</h2>
          <h3 className="text-lg font-semibold text-slate-700 mt-1">Neraca</h3>
          <p className="text-slate-500 text-sm mt-1">
            Per {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* AKTIVA */}
          <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white/40 flex flex-col h-full shadow-sm">
            <div className="bg-slate-50/80 py-3 text-center border-b border-slate-200/60">
              <span className="font-extrabold text-slate-800 tracking-wide text-lg">AKTIVA</span>
            </div>
            
            <div className="p-4 sm:p-5 flex-1 space-y-4">
              <div>
                <h4 className="font-bold text-slate-700 mb-2">Aktiva Lancar</h4>
                <div className="space-y-1">
                  {aktivaLancar.map((item, idx) => (
                    <React.Fragment key={idx}>{renderRow(item.nama, item.nominal)}</React.Fragment>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200/60 mt-3">
                  {renderRow('Total Aktiva Lancar', totalAktivaLancar, true)}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-2 mt-4">Aktiva Tetap</h4>
                <div className="space-y-1">
                  {aktivaTetap.map((item, idx) => (
                    <React.Fragment key={idx}>{renderRow(item.nama, item.nominal)}</React.Fragment>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200/60 mt-3">
                  {renderRow('Total Aktiva Tetap', totalAktivaTetap, true)}
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 sm:p-5 border-t border-emerald-500/20 flex justify-between items-center mt-auto">
               <span className="font-black text-emerald-800 text-lg sm:text-xl">TOTAL AKTIVA</span>
               <div className="flex justify-between items-center w-28 sm:w-32">
                 <span className="text-[13px] font-bold text-emerald-700 mt-1">Rp</span>
                 <span className="font-black text-emerald-700 tracking-tight text-lg sm:text-xl">{totalAktiva.toLocaleString('id-ID')}</span>
               </div>
            </div>
          </div>

          {/* PASIVA */}
          <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white/40 flex flex-col h-full shadow-sm">
            <div className="bg-slate-50/80 py-3 text-center border-b border-slate-200/60">
              <span className="font-extrabold text-slate-800 tracking-wide text-lg">PASIVA</span>
            </div>
            
            <div className="p-4 sm:p-5 flex-1 space-y-4">
              <div>
                <h4 className="font-bold text-slate-700 mb-2">Kewajiban</h4>
                <div className="space-y-1">
                  {kewajiban.map((item, idx) => (
                    <React.Fragment key={idx}>{renderRow(item.nama, item.nominal)}</React.Fragment>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200/60 mt-3">
                  {renderRow('Total Kewajiban', totalKewajiban, true)}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-2 mt-4">Modal Usaha</h4>
                <div className="space-y-1">
                  {modal.map((item, idx) => (
                    <React.Fragment key={idx}>{renderRow(item.nama, item.nominal)}</React.Fragment>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-200/60 mt-3">
                  {renderRow('Total Modal', totalModal, true)}
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 sm:p-5 border-t border-emerald-500/20 flex justify-between items-center mt-auto">
               <span className="font-black text-emerald-800 text-lg sm:text-xl">TOTAL PASIVA</span>
               <div className="flex justify-between items-center w-28 sm:w-32">
                 <span className="text-[13px] font-bold text-emerald-700 mt-1">Rp</span>
                 <span className="font-black text-emerald-700 tracking-tight text-lg sm:text-xl">{totalPasiva.toLocaleString('id-ID')}</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
