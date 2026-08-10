import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoVocallet from '../assets/logo-vocallet.png';

const RegisterUmkm: React.FC = () => {
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.title = 'Daftar UMKM';
  }, []);

  const loginDenganGoogle = () => {
    // UI Mode only - Google login logic skipped
    alert("Daftar dengan Google ditekan. (Mode tampilan UI)");
  };

  const handleBack = () => {
    navigate('/login-umkm');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Password dan Konfirmasi Password tidak cocok!');
      return;
    }
    // Simulate register success to dashboard
    localStorage.setItem('vocallet_user_mode', 'umkm');
    localStorage.setItem('vocallet_token', 'mock_token_local_dev');
    localStorage.setItem('vocallet_user_email', email || 'pemilik@umkm.com');
    navigate('/setup-usaha'); // Navigate to setup form after registration
  };

  return (
    <div className="min-h-screen bg-[#f4fbf7] text-gray-900 flex flex-col items-center justify-center p-6 relative antialiased w-full">
      {/* Header Bar */}
      <header className="w-full py-4 px-6 flex items-center justify-between absolute top-0 left-0">
        <button
          onClick={handleBack}
          className="text-brand-primary p-2 hover:bg-green-100/50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-focus z-10"
          aria-label="Kembali ke halaman pilih mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="absolute inset-x-0 top-0 py-4 flex justify-center pointer-events-none">
          <span
            onClick={handleBack}
            className="font-extrabold text-lg md:text-xl text-brand-primary tracking-wide pointer-events-auto cursor-pointer"
          >
            Vocallet
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div
        id="main-content"
        ref={mainContentRef}
        className="w-full max-w-md flex flex-col focus:outline-none mt-16 mb-16"
      >
        {/* Card Form */}
        <div className="w-full bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-green-50">

          {/* Lencana Atas */}
          <div className="flex justify-between items-center mb-6">
            {/* Lencana Kiri: Ikon Toko */}
            <div className="w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
                <path d="M5.223 2.25c-.273 0-.523.136-.664.36L1.384 7.495a2.25 2.25 0 0 0-.259 1.05v11.455A2.25 2.25 0 0 0 3.375 22.25h17.25a2.25 2.25 0 0 0 2.25-2.25V8.544a2.25 2.25 0 0 0-.259-1.05L19.44 2.61a.812.812 0 0 0-.664-.36h-13.56Zm14.542 5.25H4.235l2.25-3.6h11.08l2.25 3.6Zm-6.515 4.5v9h6V12h-6Z" />
              </svg>
            </div>

            {/* Lencana Kanan: Logo Vocallet */}
            <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
              <img src={logoVocallet} alt="Vocallet" className="w-full h-full object-contain rounded-md" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight text-left mb-1">Daftar Akun Bisnis</h1>
          <p className="text-sm text-gray-500 text-left mb-6">Silakan daftar untuk membuat portal UMKM Anda.</p>

          {/* Button Daftar dengan Google */}
          <button 
            type="button"
            onClick={loginDenganGoogle}
            className="w-full flex items-center justify-center bg-[#008543] hover:bg-[#006e37] active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-focus cursor-pointer"
          >
            <svg className="w-5 h-5 mr-3 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Daftar dengan Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-xs text-gray-400 font-medium whitespace-nowrap">Atau daftar dengan email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            {/* Input Nama Bisnis */}
            <div className="flex flex-col w-full mb-4">
              <label htmlFor="name" className="text-xs font-bold text-gray-600 mb-1.5 text-left">
                Nama Pemilik / Bisnis
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda atau Bisnis Anda"
                className="w-full bg-[#f4fbf7]/40 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-green-100/50 transition-all"
                required
              />
            </div>

            {/* Input Email */}
            <div className="flex flex-col w-full mb-4">
              <label htmlFor="email" className="text-xs font-bold text-gray-600 mb-1.5 text-left">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@bisnis.com"
                className="w-full bg-[#f4fbf7]/40 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-green-100/50 transition-all"
                required
              />
            </div>

            {/* Input Password */}
            <div className="flex flex-col w-full mb-4">
              <label htmlFor="password" className="text-xs font-bold text-gray-600 mb-1.5 text-left">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f4fbf7]/40 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-green-100/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div className="flex flex-col w-full mb-6">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-600 mb-1.5 text-left">
                Konfirmasi Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f4fbf7]/40 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-green-100/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Button Submit */}
            <button
              type="submit"
              className="w-full bg-[#006B2C] hover:bg-[#005222] active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-full shadow-sm transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-focus cursor-pointer"
            >
              Daftar Dashboard Bisnis
            </button>
          </form>

          {/* Footer Card */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            Sudah mendaftarkan bisnis Anda?{' '}
            <a
              href="/login-umkm"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login-umkm');
              }}
              className="font-bold text-brand-primary hover:underline"
            >
              Masuk ke Akun
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterUmkm;
