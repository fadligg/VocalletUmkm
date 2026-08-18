import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Icon } from '@iconify/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const navigate = useNavigate();
  const [periode, setPeriode] = useState('2026-08');
  const [businessName, setBusinessName] = useState('Memuat...');
  const [stats, setStats] = useState({
    saldoKas: 0,
    saldoBank: 0,
    pendapatan: 0,
    beban: 0,
    labaBersih: 0,
    piutang: 0,
    utang: 0,
    nilaiPersediaan: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartFilter, setChartFilter] = useState('bulan_ini');

  useEffect(() => {
    const fetchBusinessData = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        const [businessRes, txRes] = await Promise.all([
          api.get('/business'),
          api.get('/transactions')
        ]);
        const { business, stats: fetchedStats } = businessRes.data;
        setBusinessName(business.namaUsaha || 'Usaha Saya');
        setStats({
          ...fetchedStats,
          saldoKas: fetchedStats.saldoKas !== undefined ? fetchedStats.saldoKas : parseFloat(business.saldoKas),
          saldoBank: fetchedStats.saldoBank !== undefined ? fetchedStats.saldoBank : parseFloat(business.saldoBank)
        });
        setTransactions(txRes.data);
      } catch (err) {
        console.error('Failed to fetch business data:', err);
      }
    };
    fetchBusinessData();
  }, [navigate]);

  const formatCurrency = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const cards = [
    {
      title: 'Saldo Kas',
      value: formatCurrency(stats.saldoKas),
      icon: 'mdi:wallet-outline',
      valueColor: 'text-[#0b7b3f]',
    },
    {
      title: 'Saldo Bank',
      value: formatCurrency(stats.saldoBank),
      icon: 'mdi:bank-outline',
      valueColor: 'text-[#0b7b3f]',
    },
    {
      title: 'Pendapatan',
      value: formatCurrency(stats.pendapatan),
      icon: 'mdi:chart-line',
      valueColor: 'text-blue-600',
    },
    {
      title: 'Beban + HPP',
      value: formatCurrency(stats.beban),
      icon: 'mdi:chart-line-down',
      valueColor: 'text-red-600',
    },
    {
      title: 'Laba Bersih',
      value: formatCurrency(stats.labaBersih),
      icon: 'mdi:wallet-bifold-outline',
      valueColor: 'text-[#0b7b3f]',
    },
    {
      title: 'Piutang',
      value: formatCurrency(stats.piutang),
      icon: 'mdi:card-account-details-outline',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Utang',
      value: formatCurrency(stats.utang),
      icon: 'mdi:bank-minus',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Nilai Persediaan',
      value: formatCurrency(stats.nilaiPersediaan),
      icon: 'mdi:package-variant-closed',
      valueColor: 'text-slate-800',
    },
  ];

  const chartData = React.useMemo(() => {
    let filteredTx = transactions;
    const now = new Date();

    if (chartFilter === '7_hari') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      filteredTx = transactions.filter(tx => {
        if (!tx.date) return false;
        const d = new Date(tx.date);
        return d >= sevenDaysAgo && d <= now;
      });
    } else if (chartFilter === '30_hari') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      filteredTx = transactions.filter(tx => {
        if (!tx.date) return false;
        const d = new Date(tx.date);
        return d >= thirtyDaysAgo && d <= now;
      });
    } else {
      // bulan_ini (uses periode state)
      filteredTx = transactions.filter(tx => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        return txMonth === periode;
      });
    }

    const dailyData: Record<string, number> = {};
    
    filteredTx.forEach(tx => {
      const type = tx.type;
      let chartAmount = 0;
      
      if (type === 'penjualan') {
        chartAmount = Number(tx.amount);
      } else if (type === 'diskon_penjualan' || type === 'retur_penjualan') {
        chartAmount = -Number(tx.amount);
      }
      
      if (chartAmount !== 0) {
        const dateObj = new Date(tx.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dateStr = `${day}/${month}/${year}`;
        
        if (!dailyData[dateStr]) dailyData[dateStr] = 0;
        dailyData[dateStr] += chartAmount;
      }
    });

    const labels = Object.keys(dailyData).sort((a, b) => {
      const [d1, m1, y1] = a.split('/');
      const [d2, m2, y2] = b.split('/');
      return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
    });
    
    const data = labels.map(label => dailyData[label]);

    return {
      labels: labels.length > 0 ? labels : ['Belum ada data'],
      datasets: [
        {
          label: 'Penjualan',
          data: data.length > 0 ? data : [0],
          backgroundColor: '#0b7b3f',
          borderRadius: 4,
          barPercentage: 0.5,
        },
      ],
    };
  }, [transactions, periode, chartFilter]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return 'Rp ' + context.raw.toLocaleString('id-ID');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: '#f1f5f9',
          tickBorderDash: [4, 4],
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          },
          callback: function(value: any) {
            if (value === 0) return '0';
            return (value / 1000) + 'rb';
          }
        },
      },
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 px-4 antialiased">
      {/* Greeting Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          Selamat datang <span className="text-2xl">👋</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">{businessName}</p>
        
        {/* Period Selector */}
        <div className="mt-3 inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#0b7b3f] transition-all">
          <label htmlFor="period-select" className="text-slate-500 text-sm whitespace-nowrap">Periode:</label>
          <input 
            type="month" 
            id="period-select"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="text-slate-800 font-semibold text-sm focus:outline-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 relative">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
              <Icon icon={card.icon} className="w-4 h-4" />
              <span className="text-xs font-medium truncate">{card.title}</span>
            </div>
            <div className={`text-base sm:text-lg font-extrabold ${card.valueColor} truncate`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Sales Chart Section */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Grafik Penjualan</h2>
          <select 
            value={chartFilter}
            onChange={(e) => setChartFilter(e.target.value)}
            className="text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0b7b3f]"
          >
            <option value="7_hari">7 Hari Terakhir</option>
            <option value="30_hari">30 Hari Terakhir</option>
            <option value="bulan_ini">Sesuai Periode</option>
          </select>
        </div>
        <div className="h-48 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Hitung Zakat Card */}
      <div className="mt-6">
        <Link 
          to="/pilihan-zakat" 
          className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-100 p-4 transition-transform active:scale-[0.98] hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#0b7b3f]">
              <Icon icon="mdi:calculator-variant-outline" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Hitung Zakat</h3>
              <p className="text-xs text-slate-500 mt-0.5">Kalkulasi dan tunaikan zakat usaha Anda</p>
            </div>
          </div>
          <div className="text-slate-400">
            <Icon icon="mdi:chevron-right" className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Floating Action Button (FAB) */}
      {/* <button 
        className="fixed bottom-20 right-6 w-14 h-14 bg-[#0b7b3f] hover:bg-[#096634] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-900/20 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-100 z-50"
        aria-label="Tambah Transaksi"
      >
        <Icon icon="mdi:plus" className="w-8 h-8" />
      </button> */}
    </div>
  );
}
