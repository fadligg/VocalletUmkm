import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import SplashScreen from '../pages/SplashScreen';
import Home from '../pages/Home';
import Transaksi from '../pages/Transaksi';
import Stok from '../pages/Stok';
import Laporan from '../pages/Laporan';
import Profil from '../pages/Profil';
import LoginUmkm from '../pages/LoginUmkm';
import LoginPembeli from '../pages/LoginPembeli';
import RegisterUmkm from '../pages/RegisterUmkm';
import PilihanPeran from '../pages/PilihanPeran';
import RegisterPembeli from '../pages/RegisterPembeli';
import SetupUsaha from '../pages/SetupUsaha';
import PelangganSekitar from '../pages/PelangganSekitar';
import PedagangSekitar from '../pages/PedagangSekitar';
import ProfilPembeli from '../pages/ProfilPembeli';
import BuyerLayout from '../layouts/BuyerLayout';
import PilihanZakat from '../pages/Zakat/PilihanZakat';
import ZakatFitrah from '../pages/Zakat/ZakatFitrah';
import ZakatPerdagangan from '../pages/Zakat/ZakatPerdagangan';
import ZakatMaal from '../pages/Zakat/ZakatMaal';
import EdukasiZis from '../pages/Zakat/EdukasiZis';
import Toko from '../pages/Toko';

import JurnalUmum from '../pages/LaporanMenu/JurnalUmum';
import BukuBesar from '../pages/LaporanMenu/BukuBesar';
import NeracaSaldo from '../pages/LaporanMenu/NeracaSaldo';
import LabaRugi from '../pages/LaporanMenu/LabaRugi';
import Neraca from '../pages/LaporanMenu/Neraca';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SplashScreen />,
  },
  {
    path: '/pilihan-peran',
    element: <PilihanPeran />,
  },
  {
    path: '/login-pembeli',
    element: <LoginPembeli />,
  },
  {
    path: '/login-umkm',
    element: <LoginUmkm />,
  },
  {
    path: '/register-umkm',
    element: <RegisterUmkm />,
  },
  {
    path: '/register-pembeli',
    element: <RegisterPembeli />,
  },
  {
    path: '/setup-usaha',
    element: <SetupUsaha />,
  },
  {
    element: <BuyerLayout />,
    children: [
      {
        path: '/pedagang-sekitar',
        element: <PedagangSekitar />,
      },
      {
        path: '/profil-pembeli',
        element: <ProfilPembeli />,
      },
      {
        path: '/toko/:id',
        element: <Toko />,
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/transaksi',
        element: <Transaksi />,
      },
      {
        path: '/stok',
        element: <Stok />,
      },
      {
        path: '/laporan',
        element: <Laporan />,
      },
      {
        path: '/laporan/jurnal-umum',
        element: <JurnalUmum />,
      },
      {
        path: '/laporan/buku-besar',
        element: <BukuBesar />,
      },
      {
        path: '/laporan/neraca-saldo',
        element: <NeracaSaldo />,
      },
      {
        path: '/laporan/laba-rugi',
        element: <LabaRugi />,
      },
      {
        path: '/laporan/neraca',
        element: <Neraca />,
      },
      {
        path: '/profil',
        element: <Profil />,
      },
      {
        path: '/pelanggan-sekitar',
        element: <PelangganSekitar />,
      },
      {
        path: '/pilihan-zakat',
        element: <PilihanZakat />,
      },
      {
        path: '/pilihan-zakat/fitrah',
        element: <ZakatFitrah />,
      },
      {
        path: '/pilihan-zakat/perdagangan',
        element: <ZakatPerdagangan />,
      },
      {
        path: '/pilihan-zakat/maal',
        element: <ZakatMaal />,
      },
      {
        path: '/pilihan-zakat/edukasi',
        element: <EdukasiZis />,
      },
    ],
  },
]);
