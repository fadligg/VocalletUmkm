import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Transaksi from '../pages/Transaksi';
import Stok from '../pages/Stok';
import Laporan from '../pages/Laporan';
import Profil from '../pages/Profil';

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
        path: 'profil',
        element: <Profil />,
      },
    ],
  },
]);
