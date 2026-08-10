import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const TRANSACTIONS = [
  {
    id: 1,
    title: 'Ambil Uang Pribadi (Prive)',
    date: '10 Agustus 2026',
    time: '16:22',
    method: 'tunai',
    trxId: 'TRX-92552110',
    amount: 'Rp 200.000',
    icon: 'twemoji:purse',
    iconBg: 'bg-red-50',
  },
  {
    id: 2,
    title: 'Bayar Beban',
    date: '10 Agustus 2026',
    time: '16:22',
    method: 'tunai',
    trxId: 'TRX-9247578',
    amount: 'Rp 500.000',
    icon: 'twemoji:light-bulb',
    iconBg: 'bg-emerald-50',
  },
  {
    id: 3,
    title: 'Bayar Beban',
    date: '10 Agustus 2026',
    time: '16:22',
    method: 'tunai',
    trxId: 'TRX-9237986',
    amount: 'Rp 300.000',
    icon: 'twemoji:light-bulb',
    iconBg: 'bg-emerald-50',
  },
  {
    id: 4,
    title: 'Penjualan',
    date: '10 Agustus 2026',
    time: '16:22',
    method: 'tunai',
    trxId: 'TRX-9229284',
    amount: 'Rp 3.200.000',
    icon: 'twemoji:shopping-cart',
    iconBg: 'bg-slate-100',
  },
  {
    id: 5,
    title: 'Pembelian Barang',
    date: '10 Agustus 2026',
    time: '16:22',
    method: 'tunai',
    trxId: 'TRX-9218299',
    amount: 'Rp 2.000.000',
    icon: 'twemoji:package',
    iconBg: 'bg-orange-50',
  },
];

const MODAL_TYPES = [
  { id: 'penjualan', label: 'Penjualan', icon: 'twemoji:shopping-cart' },
  { id: 'pembelian_barang', label: 'Pembelian Barang', icon: 'twemoji:package' },
  { id: 'bayar_beban', label: 'Bayar Beban', icon: 'twemoji:light-bulb' },
  { id: 'terima_pembayaran', label: 'Terima Pembayaran Pelanggan', icon: 'twemoji:dollar-banknote' },
  { id: 'bayar_utang', label: 'Bayar Utang', icon: 'twemoji:credit-card' },
  { id: 'tambah_modal', label: 'Tambah Modal', icon: 'twemoji:bank' },
  { id: 'prive', label: 'Ambil Uang Pribadi (Prive)', icon: 'twemoji:purse' },
  { id: 'beli_aset', label: 'Beli Aset', icon: 'twemoji:hammer-and-wrench' },
  { id: 'terima_pinjaman', label: 'Terima Pinjaman', icon: 'twemoji:bank' },
  { id: 'bayar_cicilan', label: 'Bayar Cicilan Pinjaman', icon: 'twemoji:spiral-calendar' },
  { id: 'retur_penjualan', label: 'Retur Penjualan', icon: 'mdi:arrow-u-left-top', isBlue: true },
  { id: 'retur_pembelian', label: 'Retur Pembelian', icon: 'mdi:arrow-u-left-top', isBlue: true },
  { id: 'diskon_penjualan', label: 'Diskon Penjualan', icon: 'twemoji:label' },
  { id: 'barang_rusak', label: 'Barang Rusak / Kadaluarsa', icon: 'twemoji:wastebasket' },
  { id: 'bayar_ongkir', label: 'Bayar Ongkir', icon: 'twemoji:delivery-truck' },
  { id: 'transaksi_lainnya', label: 'Transaksi Lainnya', icon: 'twemoji:pencil' },
];

export default function Transaksi() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form after a slight delay to allow animation to finish smoothly
    setTimeout(() => {
      setActiveForm(null);
    }, 300);
  };

  const renderModalContent = () => {
    if (activeForm === 'penjualan') {
      return (
        <>
          {/* Penjualan Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:shopping-cart" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Penjualan</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Penjualan Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produk</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-500 cursor-pointer">
                <option>Pilih produk</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input type="number" defaultValue="1" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual /unit</label>
                <input type="number" placeholder="" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diskon (opsional)</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 leading-tight">Biaya Admin QRIS/Bank (opsional)</label>
                <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 leading-tight">Komisi Marketplace (opsional)</label>
                <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 mt-1" />
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50/80 p-4 rounded-xl space-y-2.5 text-sm border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Diskon</span>
                <span>-Rp 0</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200/60 pt-2.5 mt-2.5">
                <span>Total Diterima</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>HPP (otomatis)</span>
                <span>Rp 0</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelanggan (opsional)</label>
              <input type="text" placeholder="Nama pelanggan" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Penjualan" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Penjualan Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'bayar_beban') {
      return (
        <>
          {/* Bayar Beban Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:light-bulb" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Bayar Beban</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Bayar Beban Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Beban</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Beban Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Bayar Beban" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Bayar Beban Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'terima_pembayaran') {
      return (
        <>
          {/* Terima Pembayaran Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:dollar-banknote" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Terima Pembayaran Pelanggan</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Terima Pembayaran Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelanggan (opsional)</label>
              <input type="text" placeholder="Nama pelanggan" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Terima Pembayaran Pelanggan" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Terima Pembayaran Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'bayar_utang') {
      return (
        <>
          {/* Bayar Utang Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:credit-card" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Bayar Utang</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Bayar Utang Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier</label>
              <input type="text" placeholder="Nama supplier" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Bayar Utang" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Bayar Utang Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'tambah_modal') {
      return (
        <>
          {/* Tambah Modal Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:bank" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Tambah Modal</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tambah Modal Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Tambah Modal" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Tambah Modal Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'prive') {
      return (
        <>
          {/* Prive Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:purse" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Ambil Uang Pribadi (Prive)</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Prive Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Ambil Uang Pribadi (Prive)" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Prive Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'beli_aset') {
      return (
        <>
          {/* Beli Aset Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:hammer-and-wrench" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Beli Aset</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Beli Aset Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Aset</label>
              <input type="text" placeholder="Contoh: Gerobak, Kulkas" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Akun Aset</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Peralatan Usaha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Beli Aset" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Beli Aset Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'terima_pinjaman') {
      return (
        <>
          {/* Terima Pinjaman Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:bank" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Terima Pinjaman</h2>
            </div>
            <button 
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Terima Pinjaman Form Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Terima Pinjaman" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>

          {/* Terima Pinjaman Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => setActiveForm(null)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      );
    } else if (activeForm === 'bayar_cicilan') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:calendar" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Bayar Cicilan Pinjaman</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pokok Pinjaman</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bunga</label>
                <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Bayar Cicilan Pinjaman" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'retur_penjualan') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#4285F4] rounded flex items-center justify-center">
                <Icon icon="mdi:keyboard-return" className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Retur Penjualan</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Penjualan yang Diretur</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih penjualan</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Retur</label>
                <input type="number" defaultValue="1" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual/unit</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Retur Penjualan" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'retur_pembelian') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#4285F4] rounded flex items-center justify-center">
                <Icon icon="mdi:keyboard-return" className="w-4 h-4 text-white -scale-x-100" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Retur Pembelian</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pembelian yang Diretur</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih pembelian</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Retur</label>
                <input type="number" defaultValue="1" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli/unit</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Retur Pembelian" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'diskon_penjualan') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:label" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Diskon Penjualan</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Diskon Penjualan" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'barang_rusak') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:wastebasket" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Barang Rusak / Kadaluarsa</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produk</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih produk</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input type="number" defaultValue="1" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual /unit</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Barang Rusak / Kadaluarsa" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'bayar_ongkir') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:delivery-truck" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Bayar Ongkir</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Bayar Ongkir" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'transaksi_lainnya') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:pencil" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Transaksi Lainnya</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="number" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Akun Debit</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                  <option>1001 - Kas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Akun Kredit</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                  <option>4001 - Penjualan</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Transaksi Lainnya" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'pembelian') {
      return (
        <>
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:package" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">Pembelian Barang</h2>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            <p className="text-sm text-slate-500 mb-2">Isi detail transaksi &mdash; sistem akan membuat jurnal otomatis</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-08-11" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
              <input type="text" placeholder="Ketik nama produk" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input type="number" defaultValue="1" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli /unit</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier (wajib)</label>
              <input type="text" placeholder="Nama supplier" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea defaultValue="Pembelian Barang" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    }

    // Default: Form Selector (Grid)
    return (
      <>
        {/* Modal Header */}
        <div className="p-5 text-center relative border-b border-slate-100 shrink-0">
          <button 
            onClick={closeModal}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Apa yang terjadi?</h2>
          <p className="text-slate-500 text-sm">Pilih jenis transaksi</p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {MODAL_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    const supportedForms = [
                      'penjualan', 'bayar_beban', 'terima_pembayaran', 
                      'bayar_utang', 'tambah_modal', 'prive', 'beli_aset', 
                      'terima_pinjaman', 'bayar_cicilan', 'retur_penjualan', 
                      'retur_pembelian', 'diskon_penjualan', 'barang_rusak',
                      'bayar_ongkir', 'transaksi_lainnya', 'pembelian'
                    ];
                    if (supportedForms.includes(type.id)) {
                      setActiveForm(type.id);
                    }
                  }}
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-[#0b7b3f] bg-green-50/20' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                    {type.isBlue ? (
                      <div className="w-5 h-5 sm:w-7 sm:h-7 bg-[#4285F4] rounded flex items-center justify-center">
                        <Icon icon={type.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    ) : (
                      <Icon icon={type.icon} className="w-5 h-5 sm:w-7 sm:h-7" />
                    )}
                  </div>
                  <span className="font-medium text-slate-800 text-[12px] sm:text-[15px] leading-tight">
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-4 sm:p-6 pb-20 sm:pb-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Transaksi</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#0b7b3f] hover:bg-[#096634] text-white px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Icon icon="mdi:plus" className="w-5 h-5" />
          <span>Tambah</span>
        </button>
      </div>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon icon="mdi:magnify" className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Cari transaksi..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] focus:border-transparent text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative inline-block w-full sm:w-auto">
          <select className="w-full sm:w-auto appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
            <option>Bulan ini</option>
            <option>Bulan lalu</option>
            <option>Tahun ini</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <Icon icon="mdi:chevron-down" className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <span className="text-slate-400 text-sm">31 Juli 2026 - 30 Agustus 2026</span>
      </div>

      <div className="space-y-3">
        {TRANSACTIONS.map((trx) => (
          <div key={trx.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${trx.iconBg} flex items-center justify-center shrink-0`}>
                <Icon icon={trx.icon} className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-[15px] mb-0.5">{trx.title}</h3>
                <p className="text-xs text-slate-400">
                  {trx.date} &middot; {trx.time} &middot; {trx.method} &middot; {trx.trxId}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-semibold text-slate-800">{trx.amount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Transaksi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
          <style>
            {`
              @keyframes modalSlideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
              .animate-modal-slide-up {
                animation: modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-modal-fade-in {
                animation: modalFadeIn 0.3s ease-out forwards;
              }
            `}
          </style>
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer animate-modal-fade-in" 
            onClick={closeModal}
          ></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl shadow-2xl animate-modal-slide-up">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
}
