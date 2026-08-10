import React, { useState } from 'react';
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
  const [periode, setPeriode] = useState('2026-08');

  const cards = [
    {
      title: 'Saldo Kas',
      value: 'Rp 8.000.000',
      icon: 'mdi:wallet-outline',
      valueColor: 'text-[#0b7b3f]',
    },
    {
      title: 'Saldo Bank',
      value: 'Rp 0',
      icon: 'mdi:bank-outline',
      valueColor: 'text-[#0b7b3f]',
    },
    {
      title: 'Pendapatan',
      value: 'Rp 2.000.000',
      icon: 'mdi:chart-line',
      valueColor: 'text-blue-600',
    },
    {
      title: 'Beban + HPP',
      value: 'Rp 2.000.000',
      icon: 'mdi:chart-line-down',
      valueColor: 'text-red-600',
    },
    {
      title: 'Laba Bersih',
      value: 'Rp 0',
      icon: 'mdi:wallet-bifold-outline',
      valueColor: 'text-[#0b7b3f]',
    },
    {
      title: 'Piutang',
      value: 'Rp 0',
      icon: 'mdi:card-account-details-outline',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Utang',
      value: 'Rp 0',
      icon: 'mdi:bank-minus',
      valueColor: 'text-slate-800',
    },
    {
      title: 'Nilai Persediaan',
      value: 'Rp 1.801.200',
      icon: 'mdi:package-variant-closed',
      valueColor: 'text-slate-800',
    },
  ];

  const chartData = {
    labels: ['04/08/2026', '06/08/2026', '08/08/2026', '10/08/2026'],
    datasets: [
      {
        label: 'Penjualan',
        data: [0, 0, 0, 800000],
        backgroundColor: '#0b7b3f',
        borderRadius: 4,
        barPercentage: 0.5,
      },
    ],
  };

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
        <p className="text-slate-500 font-medium text-sm mt-1">kaju 23</p>
        
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
          <span className="text-xs font-medium text-slate-400">7 hari terakhir</span>
        </div>
        <div className="h-48 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        className="fixed bottom-20 right-6 w-14 h-14 bg-[#0b7b3f] hover:bg-[#096634] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-900/20 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-100 z-50"
        aria-label="Tambah Transaksi"
      >
        <Icon icon="mdi:plus" className="w-8 h-8" />
      </button>
    </div>
  );
}
