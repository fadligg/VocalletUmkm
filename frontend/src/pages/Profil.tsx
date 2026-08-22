import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, MapMarker, MarkerContent, MarkerPopup } from "../components/ui/map";
import { MapPin } from "lucide-react";

export default function Profil() {
  const navigate = useNavigate();
  
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState('Dagang');
  const [telepon, setTelepon] = useState('');
  const [pajak, setPajak] = useState('0');
  const [alamat, setAlamat] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [stokNegatif, setStokNegatif] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [saldoKas, setSaldoKas] = useState('0');
  const [saldoBank, setSaldoBank] = useState('0');
  const [latitude, setLatitude] = useState(-6.200000);
  const [longitude, setLongitude] = useState(106.816666);
  const [mapViewport, setMapViewport] = useState<any>({ center: [106.816666, -6.200000], zoom: 14 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      const token = localStorage.getItem('vocallet_token');
      if (!token) {
        navigate('/login-umkm');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5001/api/business', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { business } = res.data;
        if (business) {
          setNama(business.namaUsaha || '');
          setJenis(business.jenisUsaha || 'Dagang');
          setTelepon(business.noTelp || '');
          setAlamat(business.alamat || '');
          setTanggalMulai(business.tahunMulai ? business.tahunMulai.split('T')[0] : '');
          setTanggalAkhir(business.tahunAkhir ? business.tahunAkhir.split('T')[0] : '');
          setPajak(business.tarifPajak ? business.tarifPajak.toString() : '0');
          setStokNegatif(business.stokNegatif || false);
          setLogoUrl(business.logoUrl || '');
          setSaldoKas(business.saldoKas ? business.saldoKas.toString() : '0');
          setSaldoBank(business.saldoBank ? business.saldoBank.toString() : '0');
          if (business.latitude && business.longitude) {
            setLatitude(business.latitude);
            setLongitude(business.longitude);
            setMapViewport({ center: [business.longitude, business.latitude], zoom: 14 });
          }
        }
      } catch (err) {
        console.error('Failed to fetch business', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchBusiness();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchAddress = async () => {
    if (!alamat) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(alamat)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setLatitude(lat);
        setLongitude(lon);
        setMapViewport({ center: [lon, lat], zoom: 15 });
      } else {
        alert('Alamat tidak ditemukan di peta. Coba perjelas alamat Anda (misal: nama kota).');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mencari alamat.');
    }
  };

  const getAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.display_name) {
        setAlamat(data.display_name);
      }
    } catch (error) {
      console.error("Gagal mendapatkan alamat otomatis", error);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lon);
          setMapViewport({ center: [lon, lat], zoom: 15 });
          getAddressFromCoords(lat, lon); // Reverse geocoding otomatis
        },
        (error) => {
          alert('Gagal mendapatkan lokasi: ' + error.message);
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser Anda.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const token = localStorage.getItem('vocallet_token');
    if (!token) return;

    try {
      setLoading(true);
      await axios.put('http://localhost:5001/api/business', {
        namaUsaha: nama,
        jenisUsaha: jenis,
        noTelp: telepon,
        alamat,
        tahunMulai: tanggalMulai,
        tahunAkhir: tanggalAkhir,
        tarifPajak: parseFloat(pajak) || 0,
        stokNegatif,
        logoUrl,
        saldoKas: parseFloat(saldoKas) || 0,
        saldoBank: parseFloat(saldoBank) || 0,
        latitude,
        longitude
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Pengaturan berhasil disimpan!');
      window.dispatchEvent(new Event('profileUpdated'));
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Gagal menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vocallet_token');
    localStorage.removeItem('vocallet_user_mode');
    localStorage.removeItem('vocallet_user_email');
    navigate('/login-umkm');
  };

  const handleResetTransactions = async () => {
    if (window.confirm("PERHATIAN: Apakah Anda yakin ingin mereset seluruh data transaksi? Semua mutasi keuangan dan saldo akan dikembalikan ke awal. Stok dari penjualan akan dikembalikan. Tindakan ini TIDAK dapat dibatalkan!")) {
      const token = localStorage.getItem('vocallet_token');
      if (!token) return;

      try {
        setIsResetting(true);
        await axios.delete('http://localhost:5001/api/transactions/reset', {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Seluruh data transaksi berhasil di-reset!');
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || 'Gagal mereset transaksi.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6 px-4 antialiased">
      <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900 transition-colors">
        <Icon icon="mdi:arrow-left" className="w-5 h-5" />
        <span className="font-semibold text-sm">Kembali ke Home</span>
      </button>
      <h1 className="text-2xl font-extrabold text-[#0F2942] mb-4">Pengaturan Usaha</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 md:p-6 mb-6">
        {/* Profile Picture Upload */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#0b7b3f] text-white rounded-full flex items-center justify-center text-xl font-bold overflow-hidden relative">
            {isFetching ? (
              <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-full" />
            ) : logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              nama ? nama.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 mb-1.5">Foto Profil / Logo Usaha</p>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-[#0b7b3f] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#096634] transition-colors"
            >
              <Icon icon="mdi:camera-outline" className="w-4 h-4" />
              Upload Foto
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col space-y-4">
          {/* Form fields ... (same as before) */}
          {/* Nama Usaha */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nama Usaha</label>
            <input 
              type="text" 
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
            />
          </div>

          {/* Jenis Usaha */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Jenis Usaha</label>
            <select 
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f] bg-white"
            >
              <option value="Dagang">Dagang</option>
              <option value="Jasa">Jasa</option>
              <option value="Dagang+Jasa">Dagang + Jasa</option>
            </select>
          </div>

          {/* Telepon & Pajak */}
          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Telepon</label>
              <input 
                type="text" 
                inputMode="numeric"
                maxLength={15}
                value={telepon}
                onChange={(e) => setTelepon(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Tarif Pajak (%)</label>
              <input 
                type="number" 
                value={pajak}
                onChange={(e) => setPajak(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
          </div>

          {/* Saldo Awal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Saldo Awal Kas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm">Rp</span>
                </div>
                <input 
                  type="number"
                  value={saldoKas}
                  onChange={(e) => setSaldoKas(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Saldo Awal Bank</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm">Rp</span>
                </div>
                <input 
                  type="number"
                  value={saldoBank}
                  onChange={(e) => setSaldoBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Lengkap</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0b7b3f] transition-all"
                placeholder="Masukkan alamat usaha"
              />
              <button
                type="button"
                onClick={searchAddress}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cari di Peta
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-slate-700">Titik Usaha (Peta)</label>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex items-center gap-1.5 text-xs bg-[#0b7b3f] text-white px-3 py-1.5 rounded-md hover:bg-[#096634] transition-colors"
              >
                <Icon icon="mdi:crosshairs-gps" className="w-4 h-4" /> Gunakan GPS
              </button>
            </div>
            
            <div className="h-[350px] w-full rounded-lg overflow-hidden border border-slate-300">
              <Map 
                viewport={mapViewport} 
                onViewportChange={(vp) => setMapViewport(vp)}
              >
                <MapMarker
                  draggable
                  longitude={longitude}
                  latitude={latitude}
                  onDrag={(lngLat) => {
                    setLongitude(lngLat.lng);
                    setLatitude(lngLat.lat);
                  }}
                  onDragEnd={(lngLat) => {
                    getAddressFromCoords(lngLat.lat, lngLat.lng);
                  }}
                >
                  <MarkerContent>
                    <div className="cursor-move">
                      <MapPin
                        className="fill-red-500 stroke-white"
                        size={32}
                      />
                    </div>
                  </MarkerContent>
                  <MarkerPopup>
                    <div className="space-y-1 p-1">
                      <p className="text-xs font-medium text-slate-700">Koordinat</p>
                      <p className="text-[10px] text-slate-500 tabular-nums">
                        {latitude.toFixed(5)}, {longitude.toFixed(5)}
                      </p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              </Map>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <Icon icon="mdi:information" className="inline w-3 h-3 mr-1" />
              Geser pin merah untuk menyesuaikan titik kordinat usaha secara presisi.
            </p>
          </div>

          {/* Tanggal Buku */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">Tanggal Mulai Tahun Buku</label>
              <input 
                type="date" 
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1 text-[11px] sm:text-xs">Tanggal Akhir Tahun Buku</label>
              <input 
                type="date" 
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#0b7b3f] focus:ring-1 focus:ring-[#0b7b3f]" 
              />
            </div>
          </div>

          {/* Izinkan stok negatif */}
          <div className="flex items-center pt-2">
            <input 
              type="checkbox" 
              id="stokNegatif"
              checked={stokNegatif}
              onChange={(e) => setStokNegatif(e.target.checked)}
              className="w-4 h-4 text-[#0b7b3f] border-slate-300 rounded focus:ring-[#0b7b3f] accent-[#0b7b3f] cursor-pointer"
            />
            <label htmlFor="stokNegatif" className="ml-2 text-sm text-slate-700 cursor-pointer">
              Izinkan stok negatif
            </label>
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          {message && <div className="text-green-600 text-sm font-medium bg-green-50 p-2 rounded-md">{message}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0b7b3f] hover:bg-[#096634] text-white font-bold py-3 mt-2 rounded-lg transition-colors focus:outline-none disabled:opacity-70"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>

      {/* Zona Berbahaya */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5 md:p-6 mb-6">
        <h2 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
          <Icon icon="mdi:alert-circle-outline" className="w-5 h-5" />
          Zona Berbahaya
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Menghapus seluruh data transaksi. Hal ini akan mengembalikan saldo seperti semula dan mengembalikan stok yang terjual. Data yang dihapus tidak bisa dikembalikan!
        </p>
        <button 
          onClick={handleResetTransactions}
          disabled={isResetting}
          className="w-full sm:w-auto bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-lg transition-colors hover:bg-red-200 focus:outline-none disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <Icon icon="mdi:delete-sweep" className="w-5 h-5" />
          {isResetting ? 'Mereset...' : 'Reset Seluruh Transaksi'}
        </button>
      </div>

      {/* Logout Card */}
      <div 
        onClick={handleLogout}
        className="bg-white rounded-xl shadow-sm border border-red-100 p-4 flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors mb-4"
      >
        <div className="flex items-center gap-3 text-red-600 font-bold">
          <Icon icon="mdi:logout" className="w-5 h-5" />
          Keluar
        </div>
        <Icon icon="mdi:chevron-right" className="w-5 h-5 text-red-400" />
      </div>
    </div>
  );
}
