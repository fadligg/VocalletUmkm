import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { exportToExcel } from '../../tools/exportExcel';
import { exportToPdf } from '../../tools/exportPdf';

const AKUN_LIST = [
  { id: '1001', name: 'Kas' },
  { id: '1002', name: 'Bank' },
  { id: '1101', name: 'Piutang Usaha' },
  { id: '1201', name: 'Persediaan Barang' },
  { id: '2001', name: 'Utang Usaha' },
  { id: '2101', name: 'Utang Bank' },
  { id: '3001', name: 'Modal' },
  { id: '3101', name: 'Prive' },
  { id: '4001', name: 'Penjualan' },
  { id: '5001', name: 'Harga Pokok Penjualan' },
  { id: '6001', name: 'Beban Gaji' },
  { id: '6002', name: 'Beban Listrik & Air' },
  { id: '6003', name: 'Beban Sewa' },
  { id: '6004', name: 'Beban Lain-lain' },
];

const BULAN_LIST = ['Bulan ini', 'Bulan lalu', 'Tahun ini', 'Kustom'];

export default function BukuBesar() {
  const navigate = useNavigate();
  const [selectedAkun, setSelectedAkun] = useState('1001');
  const [isAkunOpen, setIsAkunOpen] = useState(false);
  
  const [selectedBulan, setSelectedBulan] = useState('Bulan ini');
  const [isBulanOpen, setIsBulanOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [bukuBesarData, setBukuBesarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBukuBesar = async () => {
      setLoading(true);
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        let url = `http://localhost:5001/api/laporan/bukubesar?kodeAkun=${selectedAkun}`;
        if (selectedBulan === 'Kustom' && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        } else if (selectedBulan !== 'Kustom') {
          url += `&periode=${selectedBulan}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBukuBesarData(res.data);
      } catch (error) {
        console.error('Error fetching buku besar:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedBulan !== 'Kustom' || (selectedBulan === 'Kustom' && startDate && endDate)) {
      fetchBukuBesar();
    }
  }, [selectedAkun, selectedBulan, startDate, endDate, navigate]);

  const handleExportExcel = () => {
    exportToExcel(bukuBesarData, `Buku_Besar_${selectedAkun}.xlsx`);
  };

  const handleExportPdf = () => {
    exportToPdf(bukuBesarData, `Buku_Besar_${selectedAkun}.pdf`);
  };

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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Buku Besar</h1>
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
        {/* Custom Akun Dropdown */}
        <div className="relative z-20">
          <label className="block text-sm font-medium text-slate-500 mb-1.5">Pilih Akun</label>
          <div className="relative w-full sm:max-w-xs">
            <button
              type="button"
              onClick={() => setIsAkunOpen(!isAkunOpen)}
              className="flex justify-between items-center w-full bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all hover:bg-white"
            >
              <span className="truncate pr-4">
                {AKUN_LIST.find(a => a.id === selectedAkun)?.id} - {AKUN_LIST.find(a => a.id === selectedAkun)?.name}
              </span>
              <Icon 
                icon="lucide:chevron-down" 
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isAkunOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isAkunOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsAkunOpen(false)}
                ></div>
                <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white/95 backdrop-blur-xl border border-white/80 rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] z-20 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    {AKUN_LIST.map((akun) => (
                      <button
                        key={akun.id}
                        onClick={() => {
                          setSelectedAkun(akun.id);
                          setIsAkunOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none ${
                          selectedAkun === akun.id 
                            ? 'bg-emerald-50 text-emerald-700 font-bold' 
                            : 'text-slate-600 font-medium'
                        }`}
                      >
                        {akun.id} - {akun.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Custom Bulan Dropdown */}
        <div className="relative z-10">
          <div className="relative mb-2 w-36">
            <button
              type="button"
              onClick={() => setIsBulanOpen(!isBulanOpen)}
              className="flex justify-between items-center w-full bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all hover:bg-white"
            >
              <span>{selectedBulan}</span>
              <Icon 
                icon="lucide:chevron-down" 
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isBulanOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isBulanOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsBulanOpen(false)}
                ></div>
                <div className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-xl border border-white/80 rounded-xl shadow-[0_10px_40px_rgb(0,0,0,0.08)] z-20 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    {BULAN_LIST.map((bulan) => (
                      <button
                        key={bulan}
                        onClick={() => {
                          setSelectedBulan(bulan);
                          setIsBulanOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none ${
                          selectedBulan === bulan 
                            ? 'bg-emerald-50 text-emerald-700 font-bold' 
                            : 'text-slate-600 font-medium'
                        }`}
                      >
                        {bulan}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {selectedBulan === 'Kustom' && (
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
          <div className="p-10 text-center text-slate-500 font-semibold">Memuat riwayat akun...</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/60 bg-white/40">
                <th className="py-4 px-4 font-bold text-slate-700 text-sm whitespace-nowrap">Tanggal</th>
                <th className="py-4 px-4 font-bold text-slate-700 text-sm whitespace-nowrap">No. Jurnal</th>
                <th className="py-4 px-4 font-bold text-slate-700 text-sm">Keterangan</th>
                <th className="py-4 px-4 font-bold text-slate-700 text-sm text-right whitespace-nowrap">Debit</th>
                <th className="py-4 px-4 font-bold text-slate-700 text-sm text-right whitespace-nowrap">Kredit</th>
                <th className="py-4 px-4 font-bold text-slate-700 text-sm text-right whitespace-nowrap">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {bukuBesarData.map((row) => (
                <tr key={row.id} className="border-b border-slate-100/50 hover:bg-white/40 transition-colors">
                  <td className="py-4 px-4 text-sm text-slate-600 align-top whitespace-nowrap leading-relaxed w-24">
                    {row.date.replace(' ', '\n').split('\n').map((str, i) => (
                      <React.Fragment key={i}>{str}<br className="sm:hidden"/></React.Fragment>
                    ))}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-400 align-top whitespace-nowrap">{row.ref}</td>
                  <td className="py-4 px-4 text-sm text-slate-700 align-top min-w-[180px] leading-relaxed">{row.description}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-slate-800 text-right align-top whitespace-nowrap">
                    {row.debit > 0 ? row.debit.toLocaleString('id-ID') : ''}
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-slate-800 text-right align-top whitespace-nowrap">
                    {row.credit > 0 ? row.credit.toLocaleString('id-ID') : ''}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800 text-right align-top whitespace-nowrap">
                    {row.balance.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

    </div>
  );
}
