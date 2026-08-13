import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../services/api';

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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Penjualan State
  const [formPenjualan, setFormPenjualan] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    productId: '',
    jumlah: '1',
    hargaJual: '',
    diskon: '',
    biayaAdmin: '',
    komisi: '',
    pelanggan: '',
    metodePembayaran: 'Tunai',
    keterangan: 'Penjualan'
  });

  // Pembelian State
  const [formPembelian, setFormPembelian] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaProduk: '',
    jumlah: '1',
    hargaBeli: '',
    supplier: '',
    metodePembayaran: 'Tunai',
    keterangan: 'Pembelian Barang'
  });

  // Bayar Beban State
    const [genericForm, setGenericForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    metodePembayaran: 'Tunai',
    keterangan: '',
    extraField: ''
  });

  const [formBayarBeban, setFormBayarBeban] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    jenisBeban: 'Beban Lain-lain',
    metodePembayaran: 'Tunai',
    keterangan: 'Bayar Beban'
  });

  const formatCurrency = (val: string) => {
    const numericVal = val.replace(/\D/g, '');
    if (!numericVal) return '';
    return parseInt(numericVal, 10).toLocaleString('id-ID');
  };

  const parseNum = (val: string) => parseInt(val.replace(/\D/g, '')) || 0;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTransactions = async (query = searchQuery) => {
    try {
      const endpoint = query ? `/transactions?q=${encodeURIComponent(query)}` : '/transactions';
      const res = await api.get(endpoint);
      if (Array.isArray(res.data)) {
        setTransactions(res.data);
      } else {
        console.error('API returned non-array:', res.data);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      setTransactions([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form after a slight delay to allow animation to finish smoothly
    setTimeout(() => {
      setActiveForm(null);
      setEditingId(null);
    }, 300);
  };

  const handleSimpanPenjualan = async () => {
    try {
      const subtotal = parseNum(formPenjualan.jumlah) * parseNum(formPenjualan.hargaJual);
      const diskon = parseNum(formPenjualan.diskon);
      const biayaAdmin = parseNum(formPenjualan.biayaAdmin);
      const komisi = parseNum(formPenjualan.komisi);
      const totalDiterima = subtotal - diskon - biayaAdmin - komisi;

      const payload = {
        trx_id: editingId && selectedTransaction ? selectedTransaction.trx_id : `TRX-${Date.now()}`,
        type: 'Penjualan',
        date: formPenjualan.tanggal,
        amount: totalDiterima,
        payment_method: formPenjualan.metodePembayaran,
        description: formPenjualan.keterangan || `Penjualan ${formPenjualan.jumlah} unit`,
        metadata: {
          productId: formPenjualan.productId,
          jumlah: formPenjualan.jumlah,
          hargaJual: formPenjualan.hargaJual,
          diskon: formPenjualan.diskon,
          biayaAdmin: formPenjualan.biayaAdmin,
          komisi: formPenjualan.komisi,
          pelanggan: formPenjualan.pelanggan
        }
      };

      const url = editingId ? `/transactions/${editingId}` : '/transactions';
      if (editingId) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      
      fetchTransactions();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimpanPembelian = async () => {
    try {
      const amount = parseNum(formPembelian.jumlah) * parseNum(formPembelian.hargaBeli);

      const payload = {
        trx_id: editingId && selectedTransaction ? selectedTransaction.trx_id : `TRX-${Date.now()}`,
        type: 'pembelian_barang',
        date: formPembelian.tanggal,
        amount: amount,
        payment_method: formPembelian.metodePembayaran,
        description: formPembelian.keterangan || `Pembelian ${formPembelian.jumlah} unit`,
        metadata: {
          namaProduk: formPembelian.namaProduk,
          jumlah: formPembelian.jumlah,
          hargaBeli: formPembelian.hargaBeli,
          supplier: formPembelian.supplier
        }
      };

      const url = editingId ? `/transactions/${editingId}` : '/transactions';
      if (editingId) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      
      fetchTransactions();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

    const handleSimpanGeneric = async () => {
    try {
      const amount = parseNum(genericForm.nominal);
      let description = genericForm.keterangan || activeForm?.replace(/_/g, ' ') || 'Transaksi';
      
      const payload = {
        trx_id: editingId && selectedTransaction ? selectedTransaction.trx_id : `TRX-${Date.now()}`,
        type: activeForm,
        date: genericForm.tanggal,
        amount: amount,
        payment_method: genericForm.metodePembayaran,
        description: description,
        metadata: {
           extraField: genericForm.extraField
        }
      };

      const url = editingId ? `/transactions/${editingId}` : '/transactions';
      if (editingId) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      
      fetchTransactions();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimpanBayarBeban = async () => {
    try {
      const amount = parseNum(formBayarBeban.nominal);

      const payload = {
        trx_id: editingId && selectedTransaction ? selectedTransaction.trx_id : `TRX-${Date.now()}`,
        type: 'bayar_beban',
        date: formBayarBeban.tanggal,
        amount: amount,
        payment_method: formBayarBeban.metodePembayaran,
        description: formBayarBeban.keterangan || 'Bayar Beban',
        metadata: {
          jenisBeban: formBayarBeban.jenisBeban
        }
      };

      const url = editingId ? `/transactions/${editingId}` : '/transactions';
      if (editingId) {
        await api.put(url, payload);
      } else {
        await api.post(url, payload);
      }
      
      fetchTransactions();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const renderModalContent = () => {
    if (activeForm === 'penjualan') {
      return (
        <>
          {/* Penjualan Form Header */}
          <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="twemoji:shopping-cart" className="w-6 h-6" />
              <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Penjualan' : 'Penjualan'}</h2>
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
              <input 
                type="date" 
                value={formPenjualan.tanggal}
                onChange={(e) => setFormPenjualan({...formPenjualan, tanggal: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produk</label>
              <select 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
                value={formPenjualan.productId}
                onChange={(e) => {
                  const pId = e.target.value;
                  const prod = products.find(p => p.id === Number(pId));
                  setFormPenjualan(prev => ({
                    ...prev,
                    productId: pId,
                    hargaJual: prod ? formatCurrency(prod.priceSell.toString()) : ''
                  }));
                }}
              >
                <option value="">Pilih produk</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input 
                  type="text" 
                  value={formPenjualan.jumlah}
                  onChange={(e) => setFormPenjualan({...formPenjualan, jumlah: formatCurrency(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual /unit</label>
                <input 
                  type="text" 
                  value={formPenjualan.hargaJual}
                  onChange={(e) => setFormPenjualan({...formPenjualan, hargaJual: formatCurrency(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diskon (opsional)</label>
              <input 
                type="text" 
                value={formPenjualan.diskon}
                onChange={(e) => setFormPenjualan({...formPenjualan, diskon: formatCurrency(e.target.value)})}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 leading-tight">Biaya Admin QRIS/Bank (opsional)</label>
                <input 
                  type="text" 
                  value={formPenjualan.biayaAdmin}
                  onChange={(e) => setFormPenjualan({...formPenjualan, biayaAdmin: formatCurrency(e.target.value)})}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 mt-1" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 leading-tight">Komisi Marketplace (opsional)</label>
                <input 
                  type="text" 
                  value={formPenjualan.komisi}
                  onChange={(e) => setFormPenjualan({...formPenjualan, komisi: formatCurrency(e.target.value)})}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 mt-1" 
                />
              </div>
            </div>

            {/* Summary Box */}
            {(() => {
              const subtotal = parseNum(formPenjualan.jumlah) * parseNum(formPenjualan.hargaJual);
              const diskon = parseNum(formPenjualan.diskon);
              const biayaAdmin = parseNum(formPenjualan.biayaAdmin);
              const komisi = parseNum(formPenjualan.komisi);
              const totalDiterima = subtotal - diskon - biayaAdmin - komisi;
              
              const prod = products.find(p => p.id === Number(formPenjualan.productId));
              const hpp = prod ? (Number(prod.priceBuy) * parseNum(formPenjualan.jumlah)) : 0;

              return (
                <div className="bg-slate-50/80 p-4 rounded-xl space-y-2.5 text-sm border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>Rp {formatCurrency(subtotal.toString())}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Diskon & Biaya Lain</span>
                    <span>-Rp {formatCurrency((diskon + biayaAdmin + komisi).toString())}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200/60 pt-2.5 mt-2.5">
                    <span>Total Diterima</span>
                    <span>Rp {formatCurrency(totalDiterima.toString())}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>HPP (otomatis)</span>
                    <span>Rp {formatCurrency(hpp.toString())}</span>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelanggan (opsional)</label>
              <input 
                type="text" 
                placeholder="Nama pelanggan" 
                value={formPenjualan.pelanggan}
                onChange={(e) => setFormPenjualan({...formPenjualan, pelanggan: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select 
                value={formPenjualan.metodePembayaran}
                onChange={(e) => setFormPenjualan({...formPenjualan, metodePembayaran: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
              >
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea 
                value={formPenjualan.keterangan}
                onChange={(e) => setFormPenjualan({...formPenjualan, keterangan: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"
              ></textarea>
            </div>
          </div>

          {/* Penjualan Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => {
                if (editingId) {
                  closeModal();
                } else {
                  setActiveForm(null);
                }
              }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanPenjualan}
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
              <input 
                type="date" 
                value={formBayarBeban.tanggal}
                onChange={(e) => setFormBayarBeban({...formBayarBeban, tanggal: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input 
                type="text" 
                value={formBayarBeban.nominal}
                onChange={(e) => setFormBayarBeban({...formBayarBeban, nominal: formatCurrency(e.target.value)})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Beban</label>
              <select 
                value={formBayarBeban.jenisBeban}
                onChange={(e) => setFormBayarBeban({...formBayarBeban, jenisBeban: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
              >
                <option>Beban Sewa</option>
                <option>Beban Listrik & Air</option>
                <option>Beban Gaji</option>
                <option>Beban Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select 
                value={formBayarBeban.metodePembayaran}
                onChange={(e) => setFormBayarBeban({...formBayarBeban, metodePembayaran: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
              >
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea 
                value={formBayarBeban.keterangan}
                onChange={(e) => setFormBayarBeban({...formBayarBeban, keterangan: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"
              ></textarea>
            </div>
          </div>

          {/* Bayar Beban Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => {
                if (editingId) {
                  closeModal();
                } else {
                  setActiveForm(null);
                }
              }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanBayarBeban}
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelanggan (opsional)</label>
              <input type="text" placeholder="Nama pelanggan" value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Terima Pembayaran Pelanggan"></textarea>
            </div>
          </div>

          {/* Terima Pembayaran Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => { if (editingId) closeModal(); else setActiveForm(null); }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanGeneric}
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier</label>
              <input type="text" placeholder="Nama supplier" value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Bayar Utang"></textarea>
            </div>
          </div>

          {/* Bayar Utang Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => { if (editingId) closeModal(); else setActiveForm(null); }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanGeneric}
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Tambah Modal"></textarea>
            </div>
          </div>

          {/* Tambah Modal Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => { if (editingId) closeModal(); else setActiveForm(null); }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanGeneric}
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Ambil Uang Pribadi (Prive)"></textarea>
            </div>
          </div>

          {/* Prive Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => { if (editingId) closeModal(); else setActiveForm(null); }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanGeneric}
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Aset</label>
              <input type="text" placeholder="Contoh: Gerobak, Kulkas" value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Akun Aset</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Peralatan Usaha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Beli Aset"></textarea>
            </div>
          </div>

          {/* Beli Aset Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => { if (editingId) closeModal(); else setActiveForm(null); }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanGeneric}
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Terima Pinjaman"></textarea>
            </div>
          </div>

          {/* Terima Pinjaman Form Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => { if (editingId) closeModal(); else setActiveForm(null); }}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanGeneric}
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pokok Pinjaman</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bunga</label>
                <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Bayar Cicilan Pinjaman"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Penjualan yang Diretur</label>
              <select value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih penjualan</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Retur</label>
                <input type="number" value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual/unit</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Retur Penjualan"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pembelian yang Diretur</label>
              <select value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih pembelian</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Retur</label>
                <input type="number" value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli/unit</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Retur Pembelian"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Diskon Penjualan"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produk</label>
              <select value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih produk</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input type="number" value={genericForm.extraField} onChange={(e) => setGenericForm({...genericForm, extraField: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual /unit</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Barang Rusak / Kadaluarsa"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Bayar Ongkir"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({...genericForm, tanggal: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({...genericForm, nominal: formatCurrency(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
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
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({...genericForm, metodePembayaran: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({...genericForm, keterangan: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Transaksi Lainnya"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">Simpan</button>
          </div>
        </>
      );
    } else if (activeForm === 'pembelian_barang') {
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
              <input 
                type="date" 
                value={formPembelian.tanggal}
                onChange={(e) => setFormPembelian({...formPembelian, tanggal: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
              <input 
                type="text" 
                placeholder="Ketik nama produk" 
                value={formPembelian.namaProduk}
                onChange={(e) => setFormPembelian({...formPembelian, namaProduk: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input 
                  type="text" 
                  value={formPembelian.jumlah}
                  onChange={(e) => setFormPembelian({...formPembelian, jumlah: formatCurrency(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli /unit</label>
                <input 
                  type="text" 
                  value={formPembelian.hargaBeli}
                  onChange={(e) => setFormPembelian({...formPembelian, hargaBeli: formatCurrency(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier (wajib)</label>
              <input 
                type="text" 
                placeholder="Nama supplier" 
                value={formPembelian.supplier}
                onChange={(e) => setFormPembelian({...formPembelian, supplier: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select 
                value={formPembelian.metodePembayaran}
                onChange={(e) => setFormPembelian({...formPembelian, metodePembayaran: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
              >
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea 
                value={formPembelian.keterangan}
                onChange={(e) => setFormPembelian({...formPembelian, keterangan: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700"
              ></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button 
              onClick={() => {
                if (editingId) {
                  closeModal();
                } else {
                  setActiveForm(null);
                }
              }} 
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button 
              onClick={handleSimpanPembelian}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >
              Simpan
            </button>
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
                      'bayar_ongkir', 'transaksi_lainnya', 'pembelian_barang'
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        {transactions.map((trx) => {
          const typeInfo = MODAL_TYPES.find(t => t.id === trx.type) || { label: trx.type, icon: 'twemoji:page-facing-up', isBlue: false };
          const iconBg = typeInfo.isBlue ? 'bg-blue-50' : 'bg-slate-100';

          return (
          <div 
            key={trx.id} 
            onClick={() => {
              setSelectedTransaction(trx);
              setIsDetailModalOpen(true);
            }}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon icon={typeInfo.icon} className={`w-6 h-6 ${typeInfo.isBlue ? 'text-blue-500' : ''}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-[15px] mb-0.5">{typeInfo.label}</h3>
                <p className="text-xs text-slate-400">
                  {new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {trx.payment_method} &middot; {trx.trx_id}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-semibold text-slate-800">Rp {parseFloat(trx.amount).toLocaleString('id-ID')}</span>
            </div>
          </div>
          );
        })}
        {transactions.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-white/40 rounded-2xl border border-dashed border-slate-200">
            Belum ada transaksi.
          </div>
        )}
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

      {/* Modal Detail Transaksi */}
      {isDetailModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer animate-modal-fade-in" 
            onClick={() => setIsDetailModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl shadow-2xl animate-modal-slide-up">
            <div className="p-4 sm:p-5 relative border-b border-slate-100 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${MODAL_TYPES.find(t => t.id === selectedTransaction.type)?.isBlue ? 'bg-blue-50' : 'bg-slate-100'} flex items-center justify-center`}>
                  <Icon icon={MODAL_TYPES.find(t => t.id === selectedTransaction.type)?.icon || 'twemoji:page-facing-up'} className={`w-4 h-4 ${MODAL_TYPES.find(t => t.id === selectedTransaction.type)?.isBlue ? 'text-blue-500' : ''}`} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Detail Transaksi</h2>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer">
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
               <div>
                  <p className="text-xs text-slate-500 mb-0.5">ID Transaksi</p>
                  <p className="font-medium text-slate-800">{selectedTransaction.trx_id}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-0.5">Jenis Transaksi</p>
                  <p className="font-medium text-slate-800">{MODAL_TYPES.find(t => t.id === selectedTransaction.type)?.label || selectedTransaction.type}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-0.5">Tanggal</p>
                  <p className="font-medium text-slate-800">{new Date(selectedTransaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-0.5">Nominal</p>
                  <p className="font-bold text-[#0b7b3f] text-xl">Rp {parseFloat(selectedTransaction.amount).toLocaleString('id-ID')}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-0.5">Metode Pembayaran</p>
                  <p className="font-medium text-slate-800">{selectedTransaction.payment_method}</p>
               </div>
               {(() => {
                 let meta: any = selectedTransaction.metadata;
                 if (typeof meta === 'string') {
                   try { 
                     meta = JSON.parse(meta); 
                     if (typeof meta === 'string') meta = JSON.parse(meta);
                   } catch(e) {}
                 }
                 meta = meta || {};
                 return meta.pelanggan ? (
                   <div>
                     <p className="text-xs text-slate-500 mb-0.5">Pelanggan</p>
                     <p className="font-medium text-slate-800">{meta.pelanggan}</p>
                   </div>
                 ) : null;
               })()}
               {selectedTransaction.description && (
               <div>
                  <p className="text-xs text-slate-500 mb-0.5">Keterangan</p>
                  <p className="font-medium text-slate-800">{selectedTransaction.description}</p>
               </div>
               )}
            </div>
            
            <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
               <button 
                 onClick={async () => {
                   if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
                     try {
                       const res = await fetch(`http://localhost:5001/api/transactions/${selectedTransaction.id}`, { method: 'DELETE' });
                       if (res.ok) {
                         fetchTransactions();
                         setIsDetailModalOpen(false);
                         setSelectedTransaction(null);
                       }
                     } catch (err) {
                       console.error('Failed to delete transaction', err);
                     }
                   }
                 }}
                 className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors cursor-pointer flex justify-center items-center gap-1.5"
               >
                 <Icon icon="mdi:trash-can-outline" className="w-5 h-5" /> Hapus
               </button>
               <button 
                 onClick={() => {
                   // Populate form for editing
                   if (selectedTransaction.type === 'Penjualan' || selectedTransaction.type === 'penjualan') {
                     let meta: any = selectedTransaction.metadata;
                     if (typeof meta === 'string') {
                       try { 
                         meta = JSON.parse(meta); 
                         if (typeof meta === 'string') meta = JSON.parse(meta);
                       } catch(e) {}
                     }
                     meta = meta || {};
                     
                     setFormPenjualan({
                       tanggal: selectedTransaction.date.split('T')[0],
                       productId: meta.productId || '',
                       jumlah: meta.jumlah || '1',
                       hargaJual: meta.hargaJual || selectedTransaction.amount.toString(),
                       diskon: meta.diskon || '',
                       biayaAdmin: meta.biayaAdmin || '',
                       komisi: meta.komisi || '',
                       pelanggan: meta.pelanggan || '',
                       metodePembayaran: selectedTransaction.payment_method || 'Tunai',
                       keterangan: selectedTransaction.description || ''
                     });
                     
                     setSelectedType('penjualan');
                     setActiveForm('penjualan');
                     setEditingId(selectedTransaction.id);
                     setIsDetailModalOpen(false);
                     setIsModalOpen(true);
                     } else if (selectedTransaction.type === 'Pembelian Barang' || selectedTransaction.type === 'pembelian_barang') {
                       let meta: any = selectedTransaction.metadata;
                       if (typeof meta === 'string') {
                         try { 
                           meta = JSON.parse(meta); 
                           if (typeof meta === 'string') meta = JSON.parse(meta);
                         } catch(e) {}
                       }
                       meta = meta || {};
                       
                       setFormPembelian({
                         tanggal: selectedTransaction.date.split('T')[0],
                         namaProduk: meta.namaProduk || '',
                         jumlah: meta.jumlah || '1',
                         hargaBeli: meta.hargaBeli || (selectedTransaction.amount / (parseInt(meta.jumlah) || 1)).toString(),
                         supplier: meta.supplier || '',
                         metodePembayaran: selectedTransaction.payment_method || 'Tunai',
                         keterangan: selectedTransaction.description || ''
                       });
                       
                       setSelectedType('pembelian_barang');
                       setActiveForm('pembelian_barang');
                       setEditingId(selectedTransaction.id);
                       setIsDetailModalOpen(false);
                       setIsModalOpen(true);
                   } else if (selectedTransaction.type === 'bayar_beban') {
                     let meta: any = selectedTransaction.metadata;
                     if (typeof meta === 'string') {
                       try { meta = JSON.parse(meta); if (typeof meta === 'string') meta = JSON.parse(meta); } catch(e) {}
                     }
                     meta = meta || {};
                     
                     setFormBayarBeban({
                       tanggal: selectedTransaction.date.split('T')[0],
                       nominal: selectedTransaction.amount.toString(),
                       jenisBeban: meta.jenisBeban || 'Beban Lain-lain',
                       metodePembayaran: selectedTransaction.payment_method || 'Tunai',
                       keterangan: selectedTransaction.description || ''
                     });
                     
                     setSelectedType('bayar_beban');
                     setActiveForm('bayar_beban');
                     setEditingId(selectedTransaction.id);
                     setIsDetailModalOpen(false);
                     setIsModalOpen(true);
                   } else {
                     let meta: any = selectedTransaction.metadata;
                     if (typeof meta === 'string') {
                       try { meta = JSON.parse(meta); if (typeof meta === 'string') meta = JSON.parse(meta); } catch(e) {}
                     }
                     meta = meta || {};
                     
                     setGenericForm({
                       tanggal: selectedTransaction.date.split('T')[0],
                       nominal: selectedTransaction.amount.toString(),
                       metodePembayaran: selectedTransaction.payment_method || 'Tunai',
                       keterangan: selectedTransaction.description || '',
                       extraField: meta.extraField || meta.pelanggan || meta.supplier || ''
                     });
                     
                     setSelectedType(selectedTransaction.type);
                     setActiveForm(selectedTransaction.type);
                     setEditingId(selectedTransaction.id);
                     setIsDetailModalOpen(false);
                     setIsModalOpen(true);
                   }
                 }}
                 className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer flex justify-center items-center gap-1.5"
               >
                 <Icon icon="mdi:pencil-outline" className="w-5 h-5" /> Edit
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
