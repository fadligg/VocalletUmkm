import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SetupUsaha: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State Step 1
  const [namaUsaha, setNamaUsaha] = useState('');
  const [jenisUsaha, setJenisUsaha] = useState('Dagang');
  const [noTelp, setNoTelp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [tahunMulai, setTahunMulai] = useState('2026-01-01');
  const [tahunAkhir, setTahunAkhir] = useState('2026-12-31');

  // Form State Step 2
  const [saldoKas, setSaldoKas] = useState<number | string>(0);
  const [saldoBank, setSaldoBank] = useState<number | string>(0);

  const totalModalAwal = (Number(saldoKas) || 0) + (Number(saldoBank) || 0);

  const formatCurrency = (value: number) => {
    return 'Rp ' + value.toLocaleString('id-ID');
  };

  const formatCurrencyInput = (value: string | number) => {
    if (value === 0 || value === '0') return '';
    const numericValue = String(value).replace(/\D/g, '');
    if (!numericValue) return '';
    return parseInt(numericValue, 10).toLocaleString('id-ID');
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (namaUsaha.trim() === '') {
      alert('Nama Usaha wajib diisi');
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const token = localStorage.getItem('vocallet_token');
    if (!token) {
      setError('Sesi telah berakhir. Silakan login kembali.');
      setTimeout(() => navigate('/login-umkm'), 2000);
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        namaUsaha,
        jenisUsaha,
        noTelp,
        alamat,
        tahunMulai,
        tahunAkhir,
        saldoKas,
        saldoBank
      };

      await api.post('/business/setup', payload);

      // Navigate to home after successful setup
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Terjadi kesalahan saat menyimpan data usaha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center p-6 antialiased w-full">
      {/* Header */}
      <div className="mt-8 mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-[#006B2C] mb-2 tracking-tight">Vocallet</h1>
        <p className="text-gray-500 text-sm">Pencatatan keuangan UMKM jadi simpel</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* Step Indicator */}
        <div className="flex items-center mb-6">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 1 ? 'bg-[#006B2C] text-white' : 'bg-[#006B2C] text-white'}`}>
            1
          </div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ml-2 ${currentStep === 2 ? 'bg-[#006B2C] text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
          <span className="ml-3 text-sm text-gray-600 font-medium">
            {currentStep === 1 ? 'Informasi usaha' : 'Saldo awal'}
          </span>
        </div>

        {/* Step 1 Form */}
        {currentStep === 1 && (
          <form onSubmit={handleNext} className="flex flex-col space-y-4">
            {/* Nama Usaha */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Usaha</label>
              <input
                type="text"
                value={namaUsaha}
                onChange={(e) => setNamaUsaha(e.target.value)}
                placeholder="Contoh: Warung Berkah"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#006B2C] focus:ring-1 focus:ring-[#006B2C]"
                required
              />
            </div>

            {/* Jenis Usaha */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Usaha</label>
              <div className="flex gap-2">
                {['Dagang', 'Jasa', 'Dagang+Jasa'].map((jenis) => (
                  <button
                    key={jenis}
                    type="button"
                    onClick={() => setJenisUsaha(jenis)}
                    className={`flex-1 py-2 text-sm rounded-lg border ${
                      jenisUsaha === jenis
                        ? 'border-[#006B2C] text-[#006B2C] font-semibold bg-green-50'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    {jenis}
                  </button>
                ))}
              </div>
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nomor Telepon (opsional)</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={noTelp}
                onChange={(e) => setNoTelp(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#006B2C] focus:ring-1 focus:ring-[#006B2C]"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Alamat (opsional)</label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#006B2C] focus:ring-1 focus:ring-[#006B2C]"
              />
            </div>

            {/* Tahun Buku */}
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <label className="block text-sm font-bold text-gray-700 mb-1 truncate" title="Tahun Buku Mulai">Tahun Mulai</label>
                <div className="relative">
                  <input
                    type="date"
                    value={tahunMulai}
                    onChange={(e) => setTahunMulai(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#006B2C] focus:ring-1 focus:ring-[#006B2C]"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-bold text-gray-700 mb-1 truncate" title="Tahun Buku Akhir">Tahun Akhir</label>
                <div className="relative">
                  <input
                    type="date"
                    value={tahunAkhir}
                    onChange={(e) => setTahunAkhir(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#006B2C] focus:ring-1 focus:ring-[#006B2C]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#006B2C] hover:bg-[#005222] text-white font-bold py-3 rounded-lg shadow-sm transition-colors focus:outline-none"
              >
                Lanjut
              </button>
            </div>
          </form>
        )}

        {/* Step 2 Form */}
        {currentStep === 2 && (
          <form onSubmit={handleFinish} className="flex flex-col space-y-5">
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Masukkan saldo awal kas & bank. Sistem akan mencatatnya sebagai modal awal.
            </p>

            {/* Saldo Kas */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Saldo Awal Kas</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(saldoKas)}
                  onChange={(e) => setSaldoKas(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-[#006B2C] focus:ring-1 focus:ring-[#006B2C]"
                />
              </div>
            </div>

            {/* Saldo Bank */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Saldo Awal Bank</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(saldoBank)}
                  onChange={(e) => setSaldoBank(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-[#006B2C] focus:ring-1 focus:ring-[#006B2C]"
                />
              </div>
            </div>

            {/* Total Modal Awal */}
            <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-100">
              <span className="text-sm text-gray-600">Total Modal Awal</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(totalModalAwal)}</span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-colors focus:outline-none disabled:opacity-70"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#006B2C] hover:bg-[#005222] text-white font-bold py-3 rounded-lg shadow-sm transition-colors focus:outline-none disabled:opacity-70"
              >
                {loading ? 'Memproses...' : 'Mulai Pencatatan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetupUsaha;
