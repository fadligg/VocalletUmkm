import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { MapPin, Store, ArrowLeft } from 'lucide-react';

export default function Toko() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchToko = async () => {
      const token = localStorage.getItem('vocallet_token');
      try {
        const res = await axios.get(`http://localhost:5001/api/business/profile/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setBusiness(res.data.business);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat profil toko.');
      } finally {
        setLoading(false);
      }
    };
    fetchToko();
  }, [id]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const handleOrderWA = (product: any) => {
    if (!business?.noTelp) {
      alert("Pedagang tidak memiliki nomor WhatsApp yang terdaftar.");
      return;
    }
    
    let phone = business.noTelp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    
    const message = `Halo ${business.namaUsaha}, saya ingin memesan:\n\n*${product.name}*\nHarga: ${formatRupiah(Number(product.priceSell))}\n\nApakah produk ini masih tersedia?`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(waUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></span>
        <p className="text-gray-500 font-medium">Memuat profil toko...</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 font-bold mb-4">{error || 'Toko tidak ditemukan'}</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Kembali</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-extrabold text-blue-900 tracking-wide">Profil Toko</h1>
      </div>

      {/* Profil Toko Info */}
      <div className="bg-white p-6 shadow-sm mb-4 rounded-b-3xl border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden border-2 border-green-100 shrink-0 shadow-sm">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-10 h-10" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">{business.namaUsaha}</h2>
            <div className="inline-block mb-2 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">
              {business.jenisUsaha}
            </div>
            {business.alamat && (
              <div className="flex items-start gap-1.5 text-xs text-gray-500 font-medium mt-1">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" />
                <span className="leading-tight">{business.alamat}</span>
              </div>
            )}
            {business.noTelp && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                <Icon icon="mdi:phone" className="w-3.5 h-3.5 text-green-500" />
                <span>{business.noTelp}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daftar Produk */}
      <div className="px-4">
        <h3 className="text-sm font-black text-gray-800 tracking-wide mb-3">Produk Tersedia ({products.length})</h3>
        
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100">
            <Icon icon="mdi:package-variant-closed" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Toko ini belum menambahkan produk.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform group">
                <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Icon icon="mdi:image-outline" className="w-10 h-10 text-slate-300" />
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">Habis</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <div className="mt-auto pt-2 border-t border-gray-50 flex flex-col gap-0.5">
                    <p className="text-[10px] text-gray-500">Stok: <span className="font-bold text-gray-700">{product.stock} {product.unit}</span></p>
                    <p className="text-sm font-extrabold text-blue-600 mb-2">{formatRupiah(Number(product.priceSell))}</p>
                    <button 
                      onClick={() => handleOrderWA(product)}
                      disabled={product.stock <= 0}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[11px] font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <Icon icon="mdi:whatsapp" className="w-4 h-4" />
                      Pesan via WA
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
