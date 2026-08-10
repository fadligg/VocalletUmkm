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
import RegisterUmkm from '../pages/RegisterUmkm';
import SetupUsaha from '../pages/SetupUsaha';

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
    path: '/login-umkm',
    element: <LoginUmkm />,
  },
  {
    path: '/register-umkm',
    element: <RegisterUmkm />,
  },
  {
    path: '/setup-usaha',
    element: <SetupUsaha />,
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
    ],
  },
]);
