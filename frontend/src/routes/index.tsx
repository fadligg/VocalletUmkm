import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Transaksi from '../pages/Transaksi';
import Stok from '../pages/Stok';
import Laporan from '../pages/Laporan';
import Profil from '../pages/Profil';

import JurnalUmum from '../pages/LaporanMenu/JurnalUmum';
import BukuBesar from '../pages/LaporanMenu/BukuBesar';
import NeracaSaldo from '../pages/LaporanMenu/NeracaSaldo';
import LabaRugi from '../pages/LaporanMenu/LabaRugi';
import Neraca from '../pages/LaporanMenu/Neraca';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'transaksi',
        element: <Transaksi />,
      },
      {
        path: 'stok',
        element: <Stok />,
      },
      {
        path: 'laporan',
        element: <Laporan />,
      },
      {
        path: 'laporan/jurnal-umum',
        element: <JurnalUmum />,
      },
      {
        path: 'laporan/buku-besar',
        element: <BukuBesar />,
      },
      {
        path: 'laporan/neraca-saldo',
        element: <NeracaSaldo />,
      },
      {
        path: 'laporan/laba-rugi',
        element: <LabaRugi />,
      },
      {
        path: 'laporan/neraca',
        element: <Neraca />,
      },
      {
        path: 'profil',
        element: <Profil />,
      },
    ],
  },
]);
