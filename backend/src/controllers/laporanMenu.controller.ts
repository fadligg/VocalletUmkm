import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNeraca = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const business = await prisma.business.findFirst({ where: { userId } });
    const saldoKasAwal = business ? Number(business.saldoKas) : 0;
    const saldoBankAwal = business ? Number(business.saldoBank) : 0;

    const transactions = await prisma.transaction.findMany({ where: { userId } });
    const products = await prisma.product.findMany({ where: { userId } });

    let kas = saldoKasAwal;
    let bank = saldoBankAwal;
    let piutang = 0;
    let utangUsaha = 0;
    let pendapatan = 0;
    let beban = 0;

    transactions.forEach(t => {
      const type = t.type.toLowerCase();
      const amount = Number(t.amount);
      const isBank = t.payment_method?.toLowerCase().includes('bank') || t.payment_method?.toLowerCase().includes('transfer');

      if (type.includes('pemasukan') || type.includes('penjualan') || type === 'income') {
        pendapatan += amount;
        if (isBank) bank += amount; else kas += amount;
      } else if (type.includes('pengeluaran') || type.includes('pembelian') || type.includes('beban') || type === 'expense') {
        beban += amount;
        if (isBank) bank -= amount; else kas -= amount;
      } else if (type.includes('piutang')) {
        piutang += amount;
      } else if (type.includes('utang')) {
        utangUsaha += amount;
        if (isBank) bank += amount; else kas += amount;
      }
    });

    const persediaan = products.reduce((sum, p) => sum + (p.stock * Number(p.priceBuy)), 0);
    const peralatan = 0; 
    const kendaraan = 0;
    const utangBank = 0;

    const totalAktivaLancar = kas + bank + piutang + persediaan;
    const totalAktivaTetap = peralatan + kendaraan;
    const totalAktiva = totalAktivaLancar + totalAktivaTetap;

    const kewajiban = utangUsaha + utangBank;
    
    // Auto-balancing Modal
    const modalPemilik = totalAktiva - kewajiban;

    res.json({
      aktivaLancar: {
        kas,
        bank,
        piutangUsaha: piutang,
        persediaan
      },
      aktivaTetap: {
        peralatanUsaha: peralatan,
        kendaraan
      },
      kewajiban: {
        utangUsaha,
        utangBank
      },
      modal: {
        modalPemilik
      }
    });
  } catch (error) {
    console.error('Error fetching neraca:', error);
    res.status(500).json({ message: 'Gagal mengambil data neraca', error });
  }
};

export const getLabaRugi = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const transactions = await prisma.transaction.findMany({ where: { userId } });

    let penjualan = 0;
    let hpp = 0;
    let totalBeban = 0;
    const bebanMap: Record<string, number> = {};

    transactions.forEach(t => {
      const type = t.type.toLowerCase();
      const amount = Number(t.amount);
      const desc = t.description || 'Lainnya';

      if (type.includes('pemasukan') || type.includes('penjualan') || type === 'income') {
        penjualan += amount;
      } else if (type.includes('hpp') || type.includes('pembelian stok') || type.includes('kulakan')) {
        hpp += amount;
      } else if (type.includes('pengeluaran') || type.includes('beban') || type === 'expense') {
        const bebanName = desc.toLowerCase().includes('beban') ? desc : `Beban ${desc}`;
        const key = bebanName.charAt(0).toUpperCase() + bebanName.slice(1);
        
        if (bebanMap[key]) {
          bebanMap[key] += amount;
        } else {
          bebanMap[key] = amount;
        }
        totalBeban += amount;
      }
    });

    const labaKotor = penjualan - hpp;
    const labaBersih = labaKotor - totalBeban;

    const bebanList = Object.keys(bebanMap).map(nama => ({
      nama,
      nominal: bebanMap[nama]
    }));

    res.json({
      penjualan,
      hpp,
      labaKotor,
      beban: bebanList,
      totalBeban,
      labaBersih
    });

  } catch (error) {
    console.error('Error fetching laba rugi:', error);
    res.status(500).json({ message: 'Gagal mengambil data laba rugi', error });
  }
};

export const getNeracaSaldo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const business = await prisma.business.findFirst({ where: { userId } });
    const saldoKasAwal = business ? Number(business.saldoKas) : 0;
    const saldoBankAwal = business ? Number(business.saldoBank) : 0;
    
    // Initial Modal is assumed to fund initial Kas and Bank
    const modalAwal = saldoKasAwal + saldoBankAwal;

    const transactions = await prisma.transaction.findMany({ where: { userId } });
    const products = await prisma.product.findMany({ where: { userId } });

    let kas = saldoKasAwal;
    let bank = saldoBankAwal;
    let persediaan = products.reduce((sum, p) => sum + (p.stock * Number(p.priceBuy)), 0);
    
    let piutang = 0;
    let utang = 0;
    let pendapatan = 0;
    let hpp = 0;
    
    const bebanMap: Record<string, number> = {};

    transactions.forEach(t => {
      const type = t.type.toLowerCase();
      const amount = Number(t.amount);
      const isBank = t.payment_method?.toLowerCase().includes('bank') || t.payment_method?.toLowerCase().includes('transfer');
      const desc = t.description || 'Beban Lainnya';

      if (type.includes('pemasukan') || type.includes('penjualan') || type === 'income') {
        pendapatan += amount;
        if (isBank) bank += amount; else kas += amount;
      } else if (type.includes('hpp') || type.includes('pembelian stok') || type.includes('kulakan')) {
        hpp += amount;
        if (isBank) bank -= amount; else kas -= amount;
      } else if (type.includes('pengeluaran') || type.includes('beban') || type === 'expense') {
        const bebanName = desc.toLowerCase().includes('beban') ? desc : `Beban ${desc}`;
        const key = bebanName.charAt(0).toUpperCase() + bebanName.slice(1);
        if (bebanMap[key]) bebanMap[key] += amount;
        else bebanMap[key] = amount;
        
        if (isBank) bank -= amount; else kas -= amount;
      } else if (type.includes('piutang')) {
        piutang += amount;
      } else if (type.includes('utang')) {
        utang += amount;
        if (isBank) bank += amount; else kas += amount;
      }
    });

    const neracaSaldoData = [];
    
    // 1xxx Assets (Debit)
    if (kas !== 0) neracaSaldoData.push({ kode: '1001', nama: 'Kas', debit: kas, credit: 0 });
    if (bank !== 0) neracaSaldoData.push({ kode: '1002', nama: 'Bank', debit: bank, credit: 0 });
    if (piutang !== 0) neracaSaldoData.push({ kode: '1101', nama: 'Piutang Usaha', debit: piutang, credit: 0 });
    if (persediaan !== 0) neracaSaldoData.push({ kode: '1201', nama: 'Persediaan', debit: persediaan, credit: 0 });
    
    // 2xxx Liabilities (Credit)
    if (utang !== 0) neracaSaldoData.push({ kode: '2001', nama: 'Utang Usaha', debit: 0, credit: utang });
    
    // 3xxx Equity (Credit)
    if (modalAwal !== 0) neracaSaldoData.push({ kode: '3001', nama: 'Modal Pemilik', debit: 0, credit: modalAwal });
    
    // 4xxx Revenue (Credit)
    if (pendapatan !== 0) neracaSaldoData.push({ kode: '4001', nama: 'Penjualan', debit: 0, credit: pendapatan });
    
    // 5xxx COGS (Debit)
    if (hpp !== 0) neracaSaldoData.push({ kode: '5001', nama: 'Harga Pokok Penjualan', debit: hpp, credit: 0 });
    
    // 6xxx Expenses (Debit)
    let idx = 6001;
    for (const [nama, nominal] of Object.entries(bebanMap)) {
      if (nominal !== 0) {
        neracaSaldoData.push({ kode: idx.toString(), nama, debit: nominal, credit: 0 });
        idx++;
      }
    }

    res.json(neracaSaldoData);

  } catch (error) {
    console.error('Error fetching neraca saldo:', error);
    res.status(500).json({ message: 'Gagal mengambil data neraca saldo', error });
  }
};

export const getBukuBesar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { kodeAkun } = req.query;
    if (!kodeAkun) {
      res.status(400).json({ message: 'kodeAkun is required' });
      return;
    }

    const business = await prisma.business.findFirst({ where: { userId } });
    const saldoKasAwal = business ? Number(business.saldoKas) : 0;
    const saldoBankAwal = business ? Number(business.saldoBank) : 0;

    const transactions = await prisma.transaction.findMany({ 
      where: { userId },
      orderBy: { date: 'asc' }
    });

    const mutasi: any[] = [];
    let balance = 0;

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (kodeAkun === '1001') {
      balance = saldoKasAwal;
      if (balance > 0) {
        mutasi.push({ id: 'init', date: formatDate(business?.createdAt || new Date()), ref: 'AWAL', description: 'Saldo Awal Kas', debit: balance, credit: 0, balance });
      }
    } else if (kodeAkun === '1002') {
      balance = saldoBankAwal;
      if (balance > 0) {
        mutasi.push({ id: 'init', date: formatDate(business?.createdAt || new Date()), ref: 'AWAL', description: 'Saldo Awal Bank', debit: balance, credit: 0, balance });
      }
    } else if (kodeAkun === '3001') {
      balance = saldoKasAwal + saldoBankAwal;
      if (balance > 0) {
        mutasi.push({ id: 'init', date: formatDate(business?.createdAt || new Date()), ref: 'AWAL', description: 'Modal Awal', debit: 0, credit: balance, balance });
      }
    }

    transactions.forEach(t => {
      const type = t.type.toLowerCase();
      const amount = Number(t.amount);
      const isBank = t.payment_method?.toLowerCase().includes('bank') || t.payment_method?.toLowerCase().includes('transfer');
      let debit = 0;
      let credit = 0;
      let relevant = false;

      if (kodeAkun === '1001' && !isBank) {
        if (type.includes('pemasukan') || type.includes('penjualan') || type.includes('utang') || type === 'income' || type === 'tambah_modal' || type === 'terima_pinjaman' || type === 'terima_pembayaran' || type === 'retur_pembelian') {
          debit = amount; relevant = true;
        } else if (type.includes('pengeluaran') || type.includes('hpp') || type.includes('beban') || type.includes('pembelian') || type === 'expense' || type === 'beli_aset' || type === 'bayar_utang' || type === 'bayar_cicilan' || type === 'prive' || type === 'retur_penjualan' || type === 'diskon_penjualan' || type === 'bayar_ongkir' || type === 'transaksi_lainnya') {
          credit = amount; relevant = true;
        }
      } else if (kodeAkun === '1002' && isBank) {
        if (type.includes('pemasukan') || type.includes('penjualan') || type.includes('utang') || type === 'income' || type === 'tambah_modal' || type === 'terima_pinjaman' || type === 'terima_pembayaran' || type === 'retur_pembelian') {
          debit = amount; relevant = true;
        } else if (type.includes('pengeluaran') || type.includes('hpp') || type.includes('beban') || type.includes('pembelian') || type === 'expense' || type === 'beli_aset' || type === 'bayar_utang' || type === 'bayar_cicilan' || type === 'prive' || type === 'retur_penjualan' || type === 'diskon_penjualan' || type === 'bayar_ongkir' || type === 'transaksi_lainnya') {
          credit = amount; relevant = true;
        }
      } else if (kodeAkun === '4001' && (type.includes('pemasukan') || type.includes('penjualan') || type === 'income')) {
        credit = amount; relevant = true;
      } else if (kodeAkun === '5001' && (type.includes('hpp') || type.includes('pembelian stok') || type === 'pembelian_barang')) {
        debit = amount; relevant = true;
      } else if ((kodeAkun as string).startsWith('6') && (type.includes('pengeluaran') || type.includes('beban') || type === 'expense' || type === 'bayar_beban' || type === 'bayar_ongkir' || type === 'transaksi_lainnya' || type === 'barang_rusak' || type === 'diskon_penjualan' || type === 'retur_penjualan')) {
        const desc = t.description?.toLowerCase() || '';
        let matched = false;
        if (kodeAkun === '6001' && desc.includes('gaji')) matched = true;
        else if (kodeAkun === '6002' && (desc.includes('listrik') || desc.includes('air'))) matched = true;
        else if (kodeAkun === '6003' && desc.includes('sewa')) matched = true;
        else if (kodeAkun === '6004' && !desc.includes('gaji') && !desc.includes('listrik') && !desc.includes('air') && !desc.includes('sewa')) matched = true;
        
        if (matched) {
          debit = amount; relevant = true;
        }
      } else if (kodeAkun === '2001') {
        if (type.includes('utang') && !type.includes('bayar') || type === 'terima_pinjaman') {
          credit = amount; relevant = true;
        } else if (type.includes('bayar utang') || type === 'bayar_utang' || type === 'bayar_cicilan') {
          debit = amount; relevant = true;
        }
      } else if (kodeAkun === '1101') {
        if (type.includes('piutang') && !type.includes('terima') && type !== 'terima_pembayaran') {
          debit = amount; relevant = true;
        } else if (type.includes('terima piutang') || type.includes('bayar piutang') || type === 'terima_pembayaran') {
          credit = amount; relevant = true;
        }
      } else if (kodeAkun === '1201' && type === 'beli_aset') {
        debit = amount; relevant = true;
      } else if (kodeAkun === '3001' && type === 'tambah_modal') {
        credit = amount; relevant = true;
      } else if (kodeAkun === '3101' && type === 'prive') {
        debit = amount; relevant = true;
      }

      if (relevant) {
        if (['1001', '1002', '1101', '1201', '5001'].includes(kodeAkun as string) || (kodeAkun as string).startsWith('6')) {
          balance = balance + debit - credit;
        } else {
          balance = balance + credit - debit;
        }

        mutasi.push({
          id: t.id,
          date: formatDate(t.date),
          ref: t.trx_id || `TRX-${t.id.substring(0,6)}`,
          description: t.description || 'Transaksi',
          debit,
          credit,
          balance
        });
      }
    });

    res.json(mutasi);
  } catch (error) {
    console.error('Error fetching buku besar:', error);
    res.status(500).json({ message: 'Gagal mengambil data buku besar', error });
  }
};

export const getJurnalUmum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const transactions = await prisma.transaction.findMany({ 
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const jurnalData: any[] = [];
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    transactions.forEach(t => {
      const type = t.type.toLowerCase();
      const amount = Number(t.amount);
      const isBank = t.payment_method?.toLowerCase().includes('bank') || t.payment_method?.toLowerCase().includes('transfer');
      
      const kasAccount = isBank ? { code: '1002', name: 'Bank' } : { code: '1001', name: 'Kas' };
      const entries = [];

      // Logic Mapper Double-Entry
      if (type.includes('pemasukan') || type.includes('penjualan') || type === 'income') {
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: amount, credit: 0 });
        entries.push({ accountCode: '4001', accountName: 'Penjualan', debit: 0, credit: amount });
      } else if (type.includes('hpp') || type.includes('pembelian stok') || type === 'pembelian_barang') {
        entries.push({ accountCode: '5001', accountName: 'Harga Pokok Penjualan', debit: amount, credit: 0 });
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
      } else if (type.includes('pengeluaran') || type.includes('beban') || type === 'expense' || type === 'bayar_beban') {
        let bebanCode = '6004';
        let bebanName = 'Beban Lain-lain';
        const desc = t.description?.toLowerCase() || '';
        if (desc.includes('gaji')) { bebanCode = '6001'; bebanName = 'Beban Gaji'; }
        else if (desc.includes('listrik') || desc.includes('air')) { bebanCode = '6002'; bebanName = 'Beban Listrik & Air'; }
        else if (desc.includes('sewa')) { bebanCode = '6003'; bebanName = 'Beban Sewa'; }
        else if (desc.includes('beban')) { bebanName = t.description || 'Beban'; }

        entries.push({ accountCode: bebanCode, accountName: bebanName, debit: amount, credit: 0 });
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
      } else if (type.includes('piutang') || type === 'terima_pembayaran') {
        if (type.includes('terima') || type === 'terima_pembayaran') {
          entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: amount, credit: 0 });
          entries.push({ accountCode: '1101', accountName: 'Piutang Usaha', debit: 0, credit: amount });
        } else {
          entries.push({ accountCode: '1101', accountName: 'Piutang Usaha', debit: amount, credit: 0 });
          entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
        }
      } else if (type.includes('utang') || type === 'bayar_utang' || type === 'terima_pinjaman' || type === 'bayar_cicilan') {
        if (type.includes('bayar') || type === 'bayar_utang' || type === 'bayar_cicilan') {
          entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: amount, credit: 0 });
          entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
        } else {
          entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: amount, credit: 0 });
          entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: 0, credit: amount });
        }
      } else if (type.includes('modal') || type.includes('investasi') || type === 'tambah_modal') {
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: amount, credit: 0 });
        entries.push({ accountCode: '3001', accountName: 'Modal Pemilik', debit: 0, credit: amount });
      } else if (type.includes('prive') || type.includes('pribadi')) {
        entries.push({ accountCode: '3101', accountName: 'Prive', debit: amount, credit: 0 });
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
      } else if (type === 'beli_aset') {
        entries.push({ accountCode: '1201', accountName: 'Aset Tetap', debit: amount, credit: 0 });
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
      } else if (type === 'retur_penjualan' || type === 'diskon_penjualan') {
        entries.push({ accountCode: '4002', accountName: 'Retur/Diskon Penjualan', debit: amount, credit: 0 });
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
      } else if (type === 'retur_pembelian') {
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: amount, credit: 0 });
        entries.push({ accountCode: '5002', accountName: 'Retur Pembelian', debit: 0, credit: amount });
      } else if (type === 'bayar_ongkir' || type === 'transaksi_lainnya' || type === 'barang_rusak') {
        entries.push({ accountCode: '6004', accountName: 'Beban Lain-lain', debit: amount, credit: 0 });
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
      } else {
        // Fallback untuk semua transaksi lain, setidaknya tercatat
        entries.push({ accountCode: '9999', accountName: 'Lainnya', debit: amount, credit: 0 });
        entries.push({ accountCode: kasAccount.code, accountName: kasAccount.name, debit: 0, credit: amount });
      }

      if (entries.length > 0) {
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

        jurnalData.push({
          id: t.id,
          date: formatDate(t.date),
          ref: t.trx_id || `JV-${t.id.substring(0,6).toUpperCase()}`,
          description: t.description || 'Transaksi',
          entries,
          totalDebit,
          totalCredit
        });
      }
    });

    res.json(jurnalData);

  } catch (error) {
    console.error('Error fetching jurnal umum:', error);
    res.status(500).json({ message: 'Gagal mengambil data jurnal umum', error });
  }
};
