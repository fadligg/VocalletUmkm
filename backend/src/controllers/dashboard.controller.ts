import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { cache } from '../lib/cache';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { periode, chartFilter } = req.query; // periode format: "YYYY-MM" (e.g. "2026-08")
    
    const cacheKey = `dashboard_user_${userId}_${periode}_${chartFilter}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }
    
    const business = await prisma.business.findFirst({
      where: { userId },
      orderBy: { id: 'desc' }
    });

    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    // Optimized: Use database aggregation for all-time balances
    const groupedAllTime = await prisma.transaction.groupBy({
      by: ['type', 'payment_method'],
      where: { userId },
      _sum: { amount: true }
    });

    // Optimized: Use database aggregation for current period income/expense
    const startDate = periode ? new Date(`${periode}-01T00:00:00.000Z`) : undefined;
    const endDate = periode && startDate ? new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999) : undefined;
    
    let groupedCurrentPeriod: any[] = [];
    if (startDate && endDate) {
      groupedCurrentPeriod = await prisma.transaction.groupBy({
        by: ['type', 'payment_method'],
        where: { userId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      } as any);
    }

    const products = await prisma.product.findMany({
      where: { userId }
    });

    let pendapatan = 0;
    let beban = 0;
    let piutang = 0;
    let utang = 0;
    
    // Saldo awal
    let kas = Number(business.saldoKas) || 0;
    let bank = Number(business.saldoBank) || 0;

    groupedAllTime.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amount = Number(t._sum.amount || 0);
      const isBank = t.payment_method === 'Transfer Bank' || t.payment_method === 'QRIS';
      const isUtang = t.payment_method === 'Utang' || t.payment_method === 'Kredit';

      const addCash = (val: number) => {
        if (isBank) bank += val;
        else kas += val;
      };

      switch (type) {
        case 'penjualan':
          if (isUtang) piutang += amount;
          else addCash(amount);
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          if (!isUtang) addCash(-amount);
          break;
        case 'pembelian_barang':
          if (isUtang) utang += amount;
          else addCash(-amount);
          break;
        case 'retur_pembelian':
          if (!isUtang) addCash(amount);
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
          if (isUtang) utang += amount;
          else addCash(-amount);
          break;
        case 'terima_pembayaran':
          piutang -= amount;
          addCash(amount);
          break;
        case 'bayar_utang':
        case 'bayar_cicilan':
          utang -= amount;
          addCash(-amount);
          break;
        case 'terima_pinjaman':
          utang += amount;
          addCash(amount);
          break;
        case 'tambah_modal':
          addCash(amount);
          break;
        case 'beli_aset':
        case 'prive':
        case 'transaksi_lainnya':
          if (isUtang) utang += amount;
          else addCash(-amount);
          break;
      }
    });

    groupedCurrentPeriod.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amount = Number(t._sum.amount || 0);
      
      switch (type) {
        case 'penjualan':
          pendapatan += amount;
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          pendapatan -= amount;
          break;
        case 'retur_pembelian':
          beban -= amount;
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
          beban += amount;
          break;
      }
    });

    const labaBersih = pendapatan - beban;

    const nilaiPersediaan = products.reduce((total, p) => {
      return total + (p.stock * Number(p.priceBuy));
    }, 0);

    const stats = {
      pendapatan,
      beban,
      labaBersih,
      piutang,
      utang,
      nilaiPersediaan,
      saldoKas: kas,
      saldoBank: bank
    };

    // Calculate Chart Data
    let chartStartDate: Date | undefined;
    let chartEndDate: Date | undefined;
    const now = new Date();

    if (chartFilter === '7_hari') {
      chartStartDate = new Date();
      chartStartDate.setDate(now.getDate() - 7);
      chartEndDate = now;
    } else if (chartFilter === '30_hari') {
      chartStartDate = new Date();
      chartStartDate.setDate(now.getDate() - 30);
      chartEndDate = now;
    } else if (periode) {
      chartStartDate = startDate;
      chartEndDate = endDate;
    }

    let chartWhereClause: any = { userId };
    if (chartStartDate && chartEndDate) {
      chartWhereClause.date = { gte: chartStartDate, lte: chartEndDate };
    }

    const chartTransactions = await prisma.transaction.findMany({
      where: chartWhereClause,
      select: { date: true, type: true, amount: true }
    });

    const dailyData: Record<string, number> = {};
    
    chartTransactions.forEach(tx => {
      const type = (tx.type || '').toLowerCase();
      let chartAmount = 0;
      
      if (type === 'penjualan') {
        chartAmount = Number(tx.amount);
      } else if (type === 'diskon_penjualan' || type === 'retur_penjualan') {
        chartAmount = -Number(tx.amount);
      }
      
      if (chartAmount !== 0) {
        const dateObj = new Date(tx.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dateStr = `${day}/${month}/${year}`;
        
        if (!dailyData[dateStr]) dailyData[dateStr] = 0;
        dailyData[dateStr] += chartAmount;
      }
    });

    const labels = Object.keys(dailyData).sort((a, b) => {
      const [d1, m1, y1] = a.split('/');
      const [d2, m2, y2] = b.split('/');
      return new Date(`${y1}-${m1}-${d1}`).getTime() - new Date(`${y2}-${m2}-${d2}`).getTime();
    });
    
    const data = labels.map(label => dailyData[label]);

    const chartData = {
      labels: labels.length > 0 ? labels : ['Belum ada data'],
      datasets: [
        {
          label: 'Penjualan',
          data: data.length > 0 ? data : [0],
          backgroundColor: '#0b7b3f',
          borderRadius: 4,
          barPercentage: 0.5,
        },
      ],
    };

    const responseData = { business, stats, chartData };
    cache.set(cacheKey, responseData);

    res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message || error.toString() });
  }
};
