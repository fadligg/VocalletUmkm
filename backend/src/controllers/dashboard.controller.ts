import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { periode, chartFilter } = req.query; // periode format: "YYYY-MM" (e.g. "2026-08")
    
    const business = await prisma.business.findFirst({
      where: { userId },
      orderBy: { id: 'desc' }
    });

    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    // Fetch all transactions (optimized by letting backend process it instead of frontend)
    const transactions = await prisma.transaction.findMany({
      where: { userId }
    });

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

    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amount = Number(t.amount);
      const isBank = t.payment_method === 'Transfer Bank' || t.payment_method === 'QRIS';
      const isUtang = t.payment_method === 'Utang' || t.payment_method === 'Kredit';

      const addCash = (val: number) => {
        if (isBank) bank += val;
        else kas += val;
      };

      const txDate = new Date(t.date);
      const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      const isCurrentPeriod = txMonth === periode;

      switch (type) {
        case 'penjualan':
          if (isCurrentPeriod) pendapatan += amount;
          if (isUtang) piutang += amount;
          else addCash(amount);
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          if (isCurrentPeriod) pendapatan -= amount;
          if (!isUtang) addCash(-amount);
          break;
        case 'pembelian_barang':
          if (isUtang) utang += amount;
          else addCash(-amount);
          break;
        case 'retur_pembelian':
          if (isCurrentPeriod) beban -= amount;
          if (!isUtang) addCash(amount);
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
          if (isCurrentPeriod) beban += amount;
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
    let filteredTx = transactions;
    const now = new Date();

    if (chartFilter === '7_hari') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      filteredTx = transactions.filter(tx => {
        if (!tx.date) return false;
        const d = new Date(tx.date);
        return d >= sevenDaysAgo && d <= now;
      });
    } else if (chartFilter === '30_hari') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      filteredTx = transactions.filter(tx => {
        if (!tx.date) return false;
        const d = new Date(tx.date);
        return d >= thirtyDaysAgo && d <= now;
      });
    } else if (periode) {
      filteredTx = transactions.filter(tx => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        const txMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        return txMonth === periode;
      });
    }

    const dailyData: Record<string, number> = {};
    
    filteredTx.forEach(tx => {
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

    res.status(200).json({ business, stats, chartData });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message || error.toString() });
  }
};
