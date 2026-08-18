import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoVocallet from '../assets/logo-vocallet.png';
import logoLazismu from '../assets/logo-lazismu.png';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Vocallet';
    const timer = setTimeout(() => {
      const token = localStorage.getItem('vocallet_token');
      const mode = localStorage.getItem('vocallet_user_mode');

      if (token) {
        if (mode === 'umkm') {
          navigate('/home'); // Adjusting to the new route setup instead of dashboard-umkm
        } else {
          navigate('/home');
        }
      } else {
        navigate('/pilihan-peran');
      }
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('vocallet_token');
    const mode = localStorage.getItem('vocallet_user_mode');

    if (token) {
      if (mode === 'umkm') {
        navigate('/home');
      } else {
        navigate('/home');
      }
    } else {
      navigate('/pilihan-peran');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative antialiased w-full">
      {/* Skip to Main Content Link for accessibility */}
      {/* <a 
        href="#main-content" 
        onClick={handleSkip}
        className="absolute -top-16 left-4 bg-brand-primary text-white font-bold px-4 py-2 z-[100] transition-all duration-200 focus:top-4 rounded shadow cursor-pointer"
      >
        Lewati ke konten utama (Login)
      </a> */}

      <main id="main-content" tabIndex={-1} className="w-full max-w-md text-center flex flex-col items-center justify-center space-y-6 focus:outline-none">
        <div className="mb-2">
          <img 
            src={logoVocallet} 
            alt="Ilustrasi dompet hijau 3D berisi uang dengan ikon gelombang suara di sampingnya" 
            className="w-48 rounded-3xl h-auto mx-auto object-contain drop-shadow-lg"
          />
        </div>

        <div className="flex flex-col items-center">
          <h1 className="font-bold text-4xl md:text-5xl text-brand-primary mb-1">Vocallet</h1>
          <p className="font-light text-lg md:text-xl text-brand-secondary leading-tight">
            Asisten Finansial dan Zakat<br />Berbasis Suara
          </p>
        </div>

        <div 
          className="inline-flex items-center gap-2 bg-brand-light text-brand-primary px-5 py-2 rounded-full shadow-sm border border-green-200 font-medium" 
          aria-label="Aplikasi mendukung kontrol suara"
        >
          <span aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </span>
          Voice Ready
        </div>
      </main>

      <footer>  
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-10">
          <p className="text-xs text-green-800 font-bold px-3">Didukung Oleh:</p>
          <div className="flex items-center bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-green-100" aria-label="Didukung oleh Lazismu">
            <img src={logoLazismu} alt="Logo Lazismu" className="h-12 md:h-24 object-contain" />
          </div>
        </div>  
      </footer>
    </div>
  );
};

export default SplashScreen;
