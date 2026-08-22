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
  const [filterType, setFilterType] = useState('Semua');
  const [filterPeriod, setFilterPeriod] = useState('Semua Waktu');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = () => {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  // Penjualan State
  const [formPenjualan, setFormPenjualan] = useState({
    tanggal: getLocalDateString(),
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
    tanggal: getLocalDateString(),
    namaProduk: '',
    jumlah: '1',
    hargaBeli: '',
    supplier: '',
    metodePembayaran: 'Tunai',
    keterangan: 'Pembelian Barang'
  });

  // Bayar Beban State
  const [genericForm, setGenericForm] = useState({
    tanggal: getLocalDateString(),
    nominal: '',
    metodePembayaran: 'Tunai',
    keterangan: '',
    extraField: ''
  });

  const [formBayarBeban, setFormBayarBeban] = useState({
    tanggal: getLocalDateString(),
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
      setCurrentPage(1); // Reset to page 1 on search
      fetchTransactions(searchQuery, 1, filterType, filterPeriod, startDate, endDate);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchTransactions(searchQuery, currentPage, filterType, filterPeriod, startDate, endDate);
  }, [currentPage, filterType, filterPeriod, startDate, endDate]);

  const [piutangList, setPiutangList] = useState<{nama: string, sisaUtang: number}[]>([]);
  const [utangList, setUtangList] = useState<{nama: string, sisaUtang: number}[]>([]);

  const fetchHutangPiutang = async () => {
    try {
      const res = await api.get('/transactions');
      let piutangMap: Record<string, number> = {};
      let utangMap: Record<string, number> = {};
      const allTx = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      allTx.forEach((tx: any) => {
        const type = tx.type;
        const meta = tx.metadata ? (typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata) : {};
        
        // Perhitungan Piutang
        if (type === 'Penjualan' && (tx.payment_method === 'Utang' || tx.payment_method === 'Kredit')) {
           const nama = meta.pelanggan || '';
           if (nama) {
             piutangMap[nama] = (piutangMap[nama] || 0) + Number(tx.amount);
           }
        } else if (type === 'terima_pembayaran') {
           const nama = meta.extraField || '';
           if (nama) {
             piutangMap[nama] = (piutangMap[nama] || 0) - Number(tx.amount);
           }
        }

        // Perhitungan Utang
        if (type === 'pembelian_barang' && (tx.payment_method === 'Utang' || tx.payment_method === 'Kredit')) {
           const nama = meta.supplier || '';
           if (nama) {
             utangMap[nama] = (utangMap[nama] || 0) + Number(tx.amount);
           }
        } else if (type === 'bayar_utang') {
           const nama = meta.extraField || '';
           if (nama) {
             utangMap[nama] = (utangMap[nama] || 0) - Number(tx.amount);
           }
        }
      });
      
      const listP = Object.keys(piutangMap).map(k => ({ nama: k, sisaUtang: piutangMap[k] })).filter(item => item.sisaUtang > 0);
      setPiutangList(listP);

      const listU = Object.keys(utangMap).map(k => ({ nama: k, sisaUtang: utangMap[k] })).filter(item => item.sisaUtang > 0);
      setUtangList(listU);
    } catch (e) {
      console.error('Failed to fetch hutang/piutang', e);
    }
  };

  useEffect(() => {
    if (activeForm === 'terima_pembayaran' || activeForm === 'bayar_utang') {
      fetchHutangPiutang();
    }
  }, [activeForm]);

  const fetchTransactions = async (query = searchQuery, page = currentPage, type = filterType, period = filterPeriod, start = startDate, end = endDate) => {
    try {
      let endpoint = `/transactions?page=${page}&limit=${limit}`;
      if (query) endpoint += `&q=${encodeURIComponent(query)}`;
      if (type && type !== 'Semua') endpoint += `&type=${encodeURIComponent(type)}`;
      
      let finalStart = start;
      let finalEnd = end;

      if (period !== 'Semua Waktu' && period !== 'Kustom') {
        const now = new Date();
        if (period === 'Hari ini') {
          finalStart = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          finalEnd = finalStart;
        } else if (period === 'Minggu ini') {
          const curr = new Date(now);
          const first = curr.getDate() - curr.getDay();
          const firstDay = new Date(curr.setDate(first));
          finalStart = new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          const lastDay = new Date(firstDay);
          lastDay.setDate(lastDay.getDate() + 6);
          finalEnd = new Date(lastDay.getTime() - (lastDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        } else if (period === 'Bulan ini') {
          const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
          finalStart = new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          finalEnd = new Date(lastDay.getTime() - (lastDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        } else if (period === 'Tahun ini') {
          const firstDay = new Date(now.getFullYear(), 0, 1);
          finalStart = new Date(firstDay.getTime() - (firstDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          const lastDay = new Date(now.getFullYear(), 11, 31);
          finalEnd = new Date(lastDay.getTime() - (lastDay.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }
      }

      if (finalStart && finalEnd) {
        endpoint += `&startDate=${finalStart}&endDate=${finalEnd}`;
      }

      const res = await api.get(endpoint);
      if (res.data && Array.isArray(res.data.data)) {
        setTransactions(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || 1);
      } else if (Array.isArray(res.data)) {
        // Fallback for old API behavior
        setTransactions(res.data);
        setTotalPages(1);
      } else {
        console.error('API returned unexpected format:', res.data);
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


  const getJournalImpact = (type: string | null, method: string, nominalAmount: number = 0) => {
    const isUtang = method === 'Utang' || method === 'Kredit';
    const fmt = nominalAmount ? ` Rp ${nominalAmount.toLocaleString('id-ID')}` : '';
    switch (type) {
      case 'penjualan': return isUtang ? `Piutang (+)${fmt}, Pendapatan (+)${fmt}` : `Kas/Bank (+)${fmt}, Pendapatan (+)${fmt}`;
      case 'pembelian_barang': return isUtang ? `Persediaan (+)${fmt}, Utang (+)${fmt}` : `Persediaan (+)${fmt}, Kas/Bank (-)${fmt}`;
      case 'bayar_beban':
      case 'bayar_ongkir': return isUtang ? `Beban (+)${fmt}, Utang (+)${fmt}` : `Beban (+)${fmt}, Kas/Bank (-)${fmt}`;
      case 'terima_pembayaran': return `Kas/Bank (+)${fmt}, Piutang (-)${fmt}`;
      case 'bayar_utang':
      case 'bayar_cicilan': return `Utang (-)${fmt}, Kas/Bank (-)${fmt}`;
      case 'tambah_modal': return `Kas/Bank (+)${fmt}, Ekuitas/Modal (+)${fmt}`;
      case 'prive': return `Ekuitas/Modal (-)${fmt}, Kas/Bank (-)${fmt}`;
      case 'beli_aset': return isUtang ? `Aset (+)${fmt}, Utang (+)${fmt}` : `Aset (+)${fmt}, Kas/Bank (-)${fmt}`;
      case 'terima_pinjaman': return `Kas/Bank (+)${fmt}, Utang (+)${fmt}`;
      case 'retur_penjualan':
      case 'diskon_penjualan': return isUtang ? `Pendapatan (-)${fmt}, Piutang (-)${fmt}` : `Pendapatan (-)${fmt}, Kas/Bank (-)${fmt}`;
      case 'retur_pembelian': return isUtang ? `Utang (-)${fmt}, Persediaan (-)${fmt}` : `Kas/Bank (+)${fmt}, Persediaan (-)${fmt}`;
      case 'barang_rusak': return `Beban Kerugian (+)${fmt}, Persediaan (-)${fmt}`;
      case 'transaksi_lainnya': return isUtang ? `Akun Pilihan (+)${fmt}, Utang (+)${fmt}` : `Akun Pilihan (+)${fmt}, Kas/Bank (-)${fmt}`;
      default: return '';
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
    if (isSubmitting) return;

    if ((formPenjualan.metodePembayaran === 'Utang' || formPenjualan.metodePembayaran === 'Kredit') && !formPenjualan.pelanggan.trim()) {
      alert('Nama pelanggan wajib diisi untuk metode pembayaran Utang!');
      return;
    }

    setIsSubmitting(true);
    try {
      const subtotal = parseNum(formPenjualan.jumlah) * parseNum(formPenjualan.hargaJual);
      const diskon = parseNum(formPenjualan.diskon);
      const biayaAdmin = parseNum(formPenjualan.biayaAdmin);
      const komisi = parseNum(formPenjualan.komisi);
      const totalDiterima = subtotal - diskon + biayaAdmin + komisi;

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpanPembelian = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpanGeneric = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpanBayarBeban = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
                onChange={(e) => setFormPenjualan({ ...formPenjualan, tanggal: e.target.value })}
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
                  onChange={(e) => setFormPenjualan({ ...formPenjualan, jumlah: formatCurrency(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual /unit</label>
                <input
                  type="text"
                  value={formPenjualan.hargaJual}
                  onChange={(e) => setFormPenjualan({ ...formPenjualan, hargaJual: formatCurrency(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diskon (opsional)</label>
              <input
                type="text"
                value={formPenjualan.diskon}
                onChange={(e) => setFormPenjualan({ ...formPenjualan, diskon: formatCurrency(e.target.value) })}
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
                  onChange={(e) => setFormPenjualan({ ...formPenjualan, biayaAdmin: formatCurrency(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 leading-tight">Komisi Marketplace (opsional)</label>
                <input
                  type="text"
                  value={formPenjualan.komisi}
                  onChange={(e) => setFormPenjualan({ ...formPenjualan, komisi: formatCurrency(e.target.value) })}
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
              const totalDiterima = subtotal - diskon + biayaAdmin + komisi;

              const prod = products.find(p => p.id === Number(formPenjualan.productId));
              const hpp = prod ? (Number(prod.priceBuy) * parseNum(formPenjualan.jumlah)) : 0;

              return (
                <div className="bg-slate-50/80 p-4 rounded-xl space-y-2.5 text-sm border border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>Rp {formatCurrency(subtotal.toString())}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Diskon</span>
                    <span>-Rp {formatCurrency(diskon.toString())}</span>
                  </div>
                  {(biayaAdmin > 0 || komisi > 0) && (
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Tambahan</span>
                      <span>+Rp {formatCurrency((biayaAdmin + komisi).toString())}</span>
                    </div>
                  )}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pelanggan {formPenjualan.metodePembayaran === "Utang" ? <span className="text-red-500">*wajib</span> : "(opsional)"}</label>
              <input
                type="text"
                placeholder="Nama pelanggan"
                value={formPenjualan.pelanggan}
                onChange={(e) => setFormPenjualan({ ...formPenjualan, pelanggan: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select
                value={formPenjualan.metodePembayaran}
                onChange={(e) => setFormPenjualan({ ...formPenjualan, metodePembayaran: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
              >
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact('penjualan', formPenjualan.metodePembayaran, (parseNum(formPenjualan.jumlah) * parseNum(formPenjualan.hargaJual)) - parseNum(formPenjualan.diskon) + parseNum(formPenjualan.biayaAdmin) + parseNum(formPenjualan.komisi))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea
                value={formPenjualan.keterangan}
                onChange={(e) => setFormPenjualan({ ...formPenjualan, keterangan: e.target.value })}
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
              disabled={isSubmitting} onClick={handleSimpanPenjualan}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
                onChange={(e) => setFormBayarBeban({ ...formBayarBeban, tanggal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input
                type="text"
                value={formBayarBeban.nominal}
                onChange={(e) => setFormBayarBeban({ ...formBayarBeban, nominal: formatCurrency(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Beban</label>
              <select
                value={formBayarBeban.jenisBeban}
                onChange={(e) => setFormBayarBeban({ ...formBayarBeban, jenisBeban: e.target.value })}
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
                onChange={(e) => setFormBayarBeban({ ...formBayarBeban, metodePembayaran: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
              >
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact('bayar_beban', formBayarBeban.metodePembayaran, parseNum(formBayarBeban.nominal))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea
                value={formBayarBeban.keterangan}
                onChange={(e) => setFormBayarBeban({ ...formBayarBeban, keterangan: e.target.value })}
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
              disabled={isSubmitting} onClick={handleSimpanBayarBeban}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pelanggan (yang memiliki utang)</label>
              <select 
                value={genericForm.extraField} 
                onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
              >
                <option value="">-- Pilih pelanggan --</option>
                {piutangList.map((p, idx) => (
                  <option key={idx} value={p.nama}>{p.nama} - Sisa Utang: Rp {p.sisaUtang.toLocaleString('id-ID')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Terima Pembayaran Pelanggan"></textarea>
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
              disabled={isSubmitting} onClick={handleSimpanGeneric}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Supplier (yang memiliki utang)</label>
              <select 
                value={genericForm.extraField} 
                onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} 
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
              >
                <option value="">-- Pilih supplier --</option>
                {utangList.map((p, idx) => (
                  <option key={idx} value={p.nama}>{p.nama} - Sisa Utang: Rp {p.sisaUtang.toLocaleString('id-ID')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Bayar Utang"></textarea>
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
              disabled={isSubmitting} onClick={handleSimpanGeneric}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Tambah Modal"></textarea>
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
              disabled={isSubmitting} onClick={handleSimpanGeneric}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Ambil Uang Pribadi (Prive)"></textarea>
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
              disabled={isSubmitting} onClick={handleSimpanGeneric}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Aset</label>
              <input type="text" placeholder="Contoh: Gerobak, Kulkas" value={genericForm.extraField} onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Akun Aset</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Peralatan Usaha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Beli Aset"></textarea>
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
              disabled={isSubmitting} onClick={handleSimpanGeneric}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Terima Pinjaman"></textarea>
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
              disabled={isSubmitting} onClick={handleSimpanGeneric}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pokok Pinjaman</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bunga</label>
                <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Bayar Cicilan Pinjaman"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button disabled={isSubmitting} onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Penjualan yang Diretur</label>
              <select value={genericForm.extraField} onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih penjualan</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Retur</label>
                <input type="number" value={genericForm.extraField} onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual/unit</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Retur Penjualan"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button disabled={isSubmitting} onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pembelian yang Diretur</label>
              <select value={genericForm.extraField} onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih pembelian</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Retur</label>
                <input type="number" value={genericForm.extraField} onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli/unit</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Retur Pembelian"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button disabled={isSubmitting} onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Diskon Penjualan"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button disabled={isSubmitting} onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produk</label>
              <select value={genericForm.extraField} onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer text-slate-400">
                <option value="" disabled selected>Pilih produk</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input type="number" value={genericForm.extraField} onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Jual /unit</label>
                <input type="number" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Barang Rusak / Kadaluarsa"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button disabled={isSubmitting} onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Bayar Ongkir"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button disabled={isSubmitting} onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
              <input type="date" value={genericForm.tanggal} onChange={(e) => setGenericForm({ ...genericForm, tanggal: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nominal</label>
              <input type="text" value={genericForm.nominal} onChange={(e) => setGenericForm({ ...genericForm, nominal: formatCurrency(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Akun Debit</label>
                <input 
                  type="text" 
                  list="akunDebitList"
                  placeholder="Ketik nama akun..."
                  value={genericForm.extraField}
                  onChange={(e) => setGenericForm({ ...genericForm, extraField: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
                />
                <datalist id="akunDebitList">
                  <option value="Beban Lain-lain" />
                  <option value="Beban Gaji" />
                  <option value="Beban Sewa" />
                  <option value="Beban Listrik & Air" />
                  <option value="Beban Pemasaran" />
                  <option value="Perlengkapan" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Akun Kredit</label>
                <input 
                  type="text" 
                  disabled 
                  value={genericForm.metodePembayaran === 'Utang' ? 'Utang' : 'Kas / Bank'} 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none text-slate-700 cursor-not-allowed" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select value={genericForm.metodePembayaran} onChange={(e) => setGenericForm({ ...genericForm, metodePembayaran: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact(activeForm, genericForm.metodePembayaran, parseNum(genericForm.nominal))}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea value={genericForm.keterangan} onChange={(e) => setGenericForm({ ...genericForm, keterangan: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] min-h-[80px] text-slate-700" placeholder="Transaksi Lainnya"></textarea>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button onClick={() => setActiveForm(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Kembali</button>
            <button disabled={isSubmitting} onClick={handleSimpanGeneric} className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
                onChange={(e) => setFormPembelian({ ...formPembelian, tanggal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
              <input
                type="text"
                placeholder="Ketik nama produk"
                value={formPembelian.namaProduk}
                onChange={(e) => setFormPembelian({ ...formPembelian, namaProduk: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input
                  type="text"
                  value={formPembelian.jumlah}
                  onChange={(e) => setFormPembelian({ ...formPembelian, jumlah: formatCurrency(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Beli /unit</label>
                <input
                  type="text"
                  value={formPembelian.hargaBeli}
                  onChange={(e) => setFormPembelian({ ...formPembelian, hargaBeli: formatCurrency(e.target.value) })}
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
                onChange={(e) => setFormPembelian({ ...formPembelian, supplier: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select
                value={formPembelian.metodePembayaran}
                onChange={(e) => setFormPembelian({ ...formPembelian, metodePembayaran: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer"
              >
                <option>Tunai</option>
                <option>Transfer Bank</option>
                <option>QRIS</option>
              <option>Utang</option>
              </select>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2.5 mt-4">
              <Icon icon="mdi:information-outline" className="text-blue-500 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Dampak Jurnal Akuntansi</p>
                <p className="text-xs text-blue-600 mt-0.5">{getJournalImpact('pembelian_barang', formPembelian.metodePembayaran, parseNum(formPembelian.jumlah) * parseNum(formPembelian.hargaBeli))}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
              <textarea
                value={formPembelian.keterangan}
                onChange={(e) => setFormPembelian({ ...formPembelian, keterangan: e.target.value })}
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
              disabled={isSubmitting} onClick={handleSimpanPembelian}
              className="flex-1 py-2.5 rounded-lg bg-[#0b7b3f] text-white font-medium hover:bg-[#096634] transition-colors cursor-pointer"
            >{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
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
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${isSelected
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
        <div className="relative inline-block w-full sm:w-auto z-10">
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="w-full sm:w-auto appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
            <option value="Semua">Semua Transaksi</option>
            {MODAL_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <Icon icon="mdi:chevron-down" className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="relative inline-block w-full sm:w-auto z-10">
          <select value={filterPeriod} onChange={(e) => { setFilterPeriod(e.target.value); setCurrentPage(1); }} className="w-full sm:w-auto appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] text-slate-700 cursor-pointer">
            <option value="Semua Waktu">Semua Waktu</option>
            <option value="Hari ini">Hari ini</option>
            <option value="Minggu ini">Minggu ini</option>
            <option value="Bulan ini">Bulan ini</option>
            <option value="Tahun ini">Tahun ini</option>
            <option value="Kustom">Kustom Tanggal</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <Icon icon="mdi:chevron-down" className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {filterPeriod === 'Kustom' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] cursor-pointer" />
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] cursor-pointer" />
          </div>
        )}
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
                    {new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} 
                    { trx.createdAt ? ` pukul ${new Date(trx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : '' } 
                    &middot; {trx.payment_method} &middot; {trx.trx_id}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Icon icon="mdi:chevron-left" className="w-6 h-6" />
          </button>
          <span className="text-sm font-medium text-slate-600">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Icon icon="mdi:chevron-right" className="w-6 h-6" />
          </button>
        </div>
      )}

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
                  } catch (e) { }
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
                disabled={isDeleting}
                onClick={async () => {
                  if (isDeleting) return;
                  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
                    setIsDeleting(true);
                    try {
                      await api.delete(`/transactions/${selectedTransaction.id}`);
                      fetchTransactions();
                      setIsDetailModalOpen(false);
                      setSelectedTransaction(null);
                    } catch (err) {
                      console.error('Failed to delete transaction', err);
                    } finally {
                      setIsDeleting(false);
                    }
                  }
                }}
                className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 disabled:opacity-50 transition-colors cursor-pointer flex justify-center items-center gap-1.5"
              >
                {isDeleting ? (
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon icon="mdi:trash-can-outline" className="w-5 h-5" />
                )}
                {isDeleting ? 'Menghapus...' : 'Hapus'}
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
                      } catch (e) { }
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
                      } catch (e) { }
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
                  } else {
                    alert('Edit untuk jenis transaksi ini belum didukung saat ini.');
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
