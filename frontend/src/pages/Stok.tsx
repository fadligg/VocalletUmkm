  import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';



export default function Stok() {
  const [productList, setProductList] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [namaProduk, setNamaProduk] = useState('');
  const [merek, setMerek] = useState('');
  const [sku, setSku] = useState('');
  const [satuan, setSatuan] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [stokAwal, setStokAwal] = useState('');
  const [minStok, setMinStok] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Close tooltips when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    document.addEventListener('click', handleClickOutside);
    fetchProducts();
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProductList(data);
      } else {
        console.error('API returned non-array:', data);
        setProductList([]);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
      setProductList([]);
    }
  };

  const toggleTooltip = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  const formatCurrency = (val: string) => {
    const numericVal = val.replace(/\D/g, '');
    if (!numericVal) return '';
    return parseInt(numericVal, 10).toLocaleString('id-ID');
  };

  // Form Reset
  const openModal = () => {
    setNamaProduk('');
    setMerek('');
    setSku('');
    setSatuan('');
    setMinStok('');
    setHargaBeli('');
    setHargaJual('');
    setStokAwal('');
    setFoto(null);
    setError('');
    setActiveTooltip(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setNamaProduk(product.name);
    setMerek(product.brand || '');
    setSku(product.sku || '');
    setSatuan(product.unit || '');
    setMinStok(product.minStock.toString());
    setHargaBeli(product.priceBuy.toString());
    setHargaJual(product.priceSell.toString());
    setStokAwal(product.stock.toString());
    setFoto(product.imageUrl || null);
    setError('');
    setActiveTooltip(null);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFoto(null);
    }
  };

  const closeModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
  };

  const handleSimpan = () => {
    setError('');
    
    if (!namaProduk.trim()) {
      setError('Oops! Nama Produk wajib diisi ya.');
      return;
    }

    // Validation for Harga Jual <= Harga Beli
    if (hargaBeli && hargaJual) {
      const beli = parseFloat(hargaBeli.replace(/\./g, ''));
      const jual = parseFloat(hargaJual.replace(/\./g, ''));
      if (jual < beli) {
        setError('Oops! Harga Jual tidak boleh lebih rendah dari Harga Beli (HPP).');
        return;
      } else if (jual === beli) {
        setError('Oops! Harga Jual sama dengan Harga Beli, nanti nggak untung atuh! 😅');
        return;
      }
    }

    setIsLoading(true);
    
    const beliRaw = parseFloat(hargaBeli.replace(/\./g, '')) || 0;
    const jualRaw = parseFloat(hargaJual.replace(/\./g, '')) || 0;
    const stokAwalVal = parseInt(stokAwal) || 0;
    
    const payload = {
      name: namaProduk,
      brand: merek,
      sku: sku,
      unit: satuan || 'pcs',
      minStock: parseInt(minStok) || 0,
      priceBuy: beliRaw,
      priceSell: jualRaw,
      stock: stokAwalVal,
      imageUrl: foto
    };

    if (editingId) {
      fetch(`http://localhost:5001/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          setProductList(productList.map(p => p.id === editingId ? data : p));
          setIsLoading(false);
          closeModal();
        })
        .catch(err => {
          console.error('Failed to update product', err);
          setError('Gagal memperbarui produk');
          setIsLoading(false);
        });
    } else {
      fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          setProductList([data, ...productList]);
          setIsLoading(false);
          closeModal();
        })
        .catch(err => {
          console.error('Failed to save product', err);
          setError('Gagal menyimpan produk');
          setIsLoading(false);
        });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await fetch(`http://localhost:5001/api/products/${id}`, { method: 'DELETE' });
        setProductList(productList.filter(p => p.id !== id));
      } catch (err) {
        console.error('Failed to delete product', err);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto font-sans relative pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Stok Produk</h1>
        <button 
          onClick={openModal}
          className="flex items-center gap-2 bg-[#107c41] hover:bg-[#0c6334] text-white px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
        >
          <Icon icon="lucide:plus" className="w-5 h-5" />
          <span className="hidden sm:inline">Tambah Produk</span>
          <span className="inline sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-4">
        {productList.map((product) => (
          <div 
            key={product.id}
            className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgb(0,0,0,0.02)] rounded-2xl p-4 sm:p-5 transition-all hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="flex gap-3 sm:gap-4">
              {/* Left Icon */}
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-[#f4f7f9]/80 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Icon icon="lucide:package" className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Top Info */}
                <div className="flex justify-between items-start gap-2 sm:gap-4">
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">
                      {product.sku ? `${product.sku} · ${product.unit}` : product.unit}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-1.5 truncate">
                      Jual: Rp {formatCurrency(product.priceSell.toString())} &middot; Beli: Rp {formatCurrency(product.priceBuy.toString())}
                    </p>
                  </div>
                  <div className="flex flex-col items-end sm:items-center shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-slate-800 leading-none">{product.stock}</span>
                    <span className="text-[10px] sm:text-xs text-slate-400 mt-1">stok</span>
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-slate-200/60 my-3 sm:my-3.5" />

                {/* Bottom Info */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <span className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Min: {product.minStock} &middot; Nilai: Rp {formatCurrency((parseFloat(product.priceBuy) * parseInt(product.stock)).toString())}
                  </span>
                  <div className="flex gap-4 shrink-0 w-full justify-end sm:w-auto">
                    <button 
                      className="text-slate-400 hover:text-blue-600 transition-colors p-1 sm:p-0"
                      onClick={() => handleEdit(product)}
                    >
                      <Icon icon="lucide:pencil" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 transition-colors p-1 sm:p-0"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Icon icon="lucide:trash-2" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {productList.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-white/40 rounded-2xl border border-dashed border-slate-200">
            Belum ada produk. Tambahkan produk baru!
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 text-center flex-1 ml-8">{editingId ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors active:bg-slate-200"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              
              {/* Foto */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Foto (opsional)</label>
                <div className="flex items-center gap-3">
                  {foto && (
                    <img src={foto} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-base sm:text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 rounded-lg p-1.5 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500" 
                  />
                </div>
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Produk <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={namaProduk}
                  onChange={(e) => {
                    setNamaProduk(e.target.value);
                    if (error && error.includes('Nama')) setError('');
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                />
              </div>

              {/* Merek & SKU */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Merek (opsional)</label>
                  <input 
                    type="text" 
                    value={merek}
                    onChange={(e) => setMerek(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">SKU (opsional)</label>
                  <input 
                    type="text" 
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>

              {/* Satuan & Min Stok */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Satuan</label>
                  <input 
                    list="satuan-list" 
                    type="text" 
                    placeholder="pcs"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  />
                  <datalist id="satuan-list">
                    <option value="PCS" />
                    <option value="UNIT" />
                    <option value="SET" />
                    <option value="PACK" />
                    <option value="BOX" />
                    <option value="KG" />
                    <option value="GRAM" />
                    <option value="LITER" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min. Stok</label>
                  <input 
                    type="number"
                    value={minStok}
                    onChange={(e) => setMinStok(e.target.value)}
                    min="0"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  />
                </div>
              </div>

              {/* Harga Beli & Harga Jual */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                    Harga Beli (HPP)
                    <button 
                      onClick={(e) => toggleTooltip('beli', e)}
                      className="relative ml-1.5 flex items-center justify-center cursor-help text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
                    >
                      <Icon icon="lucide:info" className="w-4 h-4" />
                      
                      {/* Tooltip Popup */}
                      {activeTooltip === 'beli' && (
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2.5 shadow-xl z-10 text-center leading-relaxed font-normal animate-[fadeIn_0.15s_ease-out]">
                          Harga yang kamu bayar saat membeli barang dari supplier.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                        </div>
                      )}
                    </button>
                  </label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={hargaBeli}
                    onChange={(e) => setHargaBeli(formatCurrency(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
                    Harga Jual
                    <button 
                      onClick={(e) => toggleTooltip('jual', e)}
                      className="relative ml-1.5 flex items-center justify-center cursor-help text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
                    >
                      <Icon icon="lucide:info" className="w-4 h-4" />
                      
                      {/* Tooltip Popup */}
                      {activeTooltip === 'jual' && (
                        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2.5 shadow-xl z-10 text-center leading-relaxed font-normal animate-[fadeIn_0.15s_ease-out]">
                          Harga jual ke customer. Pastikan lebih tinggi dari Harga Beli!
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                        </div>
                      )}
                    </button>
                  </label>
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={hargaJual}
                    onChange={(e) => {
                      setHargaJual(formatCurrency(e.target.value));
                      if (error) setError('');
                    }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 transition-colors ${
                      error 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                    }`} 
                  />
                </div>
              </div>

              {/* Error Message with smooth animation */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  error ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                <div className="flex items-start gap-2 text-red-500 bg-red-50/50 p-3 rounded-lg border border-red-100">
                  <Icon icon="lucide:alert-circle" className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium leading-relaxed">{error}</span>
                </div>
              </div>

              {/* Stok Awal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stok Awal</label>
                <input 
                  type="number" 
                  value={stokAwal}
                  onChange={(e) => setStokAwal(e.target.value)}
                  min="0"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors mb-2" 
                />
              </div>

            </div>

            {/* Modal Footer / Submit */}
            <div className="p-4 sm:p-5 border-t border-slate-100 shrink-0">
              <button 
                onClick={handleSimpan}
                disabled={isLoading}
                className="w-full bg-[#107c41] hover:bg-[#0c6334] disabled:bg-[#107c41]/70 text-white font-semibold py-3 sm:py-2.5 rounded-xl sm:rounded-lg transition-all shadow-sm flex items-center justify-center min-h-[48px] active:scale-[0.98]"
              >
                {isLoading ? (
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
