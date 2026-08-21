import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

// Helpers
const getIsBank = (paymentMethod?: string | null) => {
  if (!paymentMethod) return false;
  const pm = paymentMethod.toLowerCase();
  return pm === 'transfer bank' || pm === 'qris' || pm.includes('bank') || pm.includes('transfer');
};

const getIsUtang = (paymentMethod?: string | null) => {
  if (!paymentMethod) return false;
  const pm = paymentMethod.toLowerCase();
  return pm === 'utang' || pm === 'kredit';
};

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
    let utangBank = 0;
    let peralatan = 0; 
    let kendaraan = 0;

    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amount = Number(t.amount);
      const isBank = getIsBank(t.payment_method);
      const isUtang = getIsUtang(t.payment_method);

      const addCash = (val: number) => {
        if (isBank) bank += val; else kas += val;
      };

      switch (type) {
        case 'penjualan':
          if (isUtang) piutang += amount; else addCash(amount);
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          if (!isUtang) addCash(-amount);
          // if isUtang, technically we should reduce piutang, handled in Jurnal Umum.
          // For Neraca, we will just reduce piutang directly:
          else piutang -= amount;
          break;
        case 'pembelian_barang':
          if (isUtang) utangUsaha += amount; else addCash(-amount);
          break;
        case 'retur_pembelian':
          if (!isUtang) addCash(amount);
          else utangUsaha -= amount;
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
        case 'transaksi_lainnya':
          if (isUtang) utangUsaha += amount; else addCash(-amount);
          break;
        case 'terima_pembayaran':
          piutang -= amount;
          addCash(amount);
          break;
        case 'bayar_utang':
        case 'bayar_cicilan':
          utangUsaha -= amount;
          addCash(-amount);
          break;
        case 'terima_pinjaman':
          utangBank += amount;
          addCash(amount);
          break;
        case 'tambah_modal':
          addCash(amount);
          break;
        case 'beli_aset':
          peralatan += amount;
          if (isUtang) utangUsaha += amount; else addCash(-amount);
          break;
        case 'prive':
          addCash(-amount);
          break;
      }
    });

    const persediaan = products.reduce((sum, p) => sum + (p.stock * Number(p.priceBuy)), 0);

    const totalAktivaLancar = kas + bank + piutang + persediaan;
    const totalAktivaTetap = peralatan + kendaraan;
    const totalAktiva = totalAktivaLancar + totalAktivaTetap;
    const kewajiban = utangUsaha + utangBank;
    const modalPemilik = totalAktiva - kewajiban; // Auto-balancing

    res.json({
      namaUsaha: business?.namaUsaha || 'Nama Usaha',
      aktivaLancar: { kas, bank, piutangUsaha: piutang, persediaan },
      aktivaTetap: { peralatanUsaha: peralatan, kendaraan },
      kewajiban: { utangUsaha, utangBank },
      modal: { modalPemilik }
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
      const type = (t.type || '').toLowerCase();
      const amount = Number(t.amount);
      const desc = t.description || 'Lainnya';

      switch (type) {
        case 'penjualan':
          penjualan += amount;
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          penjualan -= amount;
          break;
        case 'pembelian_barang':
          hpp += amount;
          break;
        case 'retur_pembelian':
          hpp -= amount;
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
        case 'transaksi_lainnya':
          const bebanName = desc.toLowerCase().includes('beban') ? desc : `Beban ${desc}`;
          const key = bebanName.charAt(0).toUpperCase() + bebanName.slice(1);
          if (bebanMap[key]) bebanMap[key] += amount;
          else bebanMap[key] = amount;
          totalBeban += amount;
          break;
      }
    });

    const labaKotor = penjualan - hpp;
    const labaBersih = labaKotor - totalBeban;
    const bebanList = Object.keys(bebanMap).map(nama => ({ nama, nominal: bebanMap[nama] }));

    res.json({
      penjualan, hpp, labaKotor, beban: bebanList, totalBeban, labaBersih
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
    
    const transactions = await prisma.transaction.findMany({ where: { userId } });
    const products = await prisma.product.findMany({ where: { userId } });

    let kas = saldoKasAwal;
    let bank = saldoBankAwal;
    let persediaan = products.reduce((sum, p) => sum + (p.stock * Number(p.priceBuy)), 0);
    
    // Initial Modal is assumed to fund initial Kas, Bank, and Inventory
    const modalAwal = saldoKasAwal + saldoBankAwal + persediaan;
    
    let piutang = 0;
    let utang = 0;
    let modal = modalAwal;
    let prive = 0;
    let penjualan = 0;
    let diskonReturPenjualan = 0;
    let hpp = 0;
    let returPembelian = 0;
    let peralatan = 0;
    
    const bebanMap: Record<string, number> = {};

    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amount = Number(t.amount);
      const isBank = getIsBank(t.payment_method);
      const isUtang = getIsUtang(t.payment_method);
      const desc = t.description || 'Beban Lainnya';

      const addCash = (val: number) => {
        if (isBank) bank += val; else kas += val;
      };

      switch(type) {
        case 'penjualan':
          penjualan += amount;
          if (isUtang) piutang += amount; else addCash(amount);
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          diskonReturPenjualan += amount;
          if (!isUtang) addCash(-amount); else piutang -= amount;
          break;
        case 'pembelian_barang':
          hpp += amount;
          if (isUtang) utang += amount; else addCash(-amount);
          break;
        case 'retur_pembelian':
          returPembelian += amount; 
          if (!isUtang) addCash(amount); else utang -= amount;
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
        case 'transaksi_lainnya':
          const bebanName = desc.toLowerCase().includes('beban') ? desc : `Beban ${desc}`;
          const key = bebanName.charAt(0).toUpperCase() + bebanName.slice(1);
          if (bebanMap[key]) bebanMap[key] += amount;
          else bebanMap[key] = amount;
          if (isUtang) utang += amount; else addCash(-amount);
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
          modal += amount;
          addCash(amount);
          break;
        case 'beli_aset':
          peralatan += amount;
          if (isUtang) utang += amount; else addCash(-amount);
          break;
        case 'prive':
          prive += amount;
          addCash(-amount);
          break;
        default:
          // Unrecognized transactions map to Beban Lainnya so they don't silently disappear
          const unkKey = `Beban Tidak Dikenal (${type})`;
          if (bebanMap[unkKey]) bebanMap[unkKey] += amount;
          else bebanMap[unkKey] = amount;
          if (isUtang) utang += amount; else addCash(-amount);
          break;
      }
    });

    const neracaSaldoData = [];
    
    // 1xxx Assets (Debit)
    if (kas !== 0) neracaSaldoData.push({ kode: '1001', nama: 'Kas', debit: kas > 0 ? kas : 0, credit: kas < 0 ? Math.abs(kas) : 0 });
    if (bank !== 0) neracaSaldoData.push({ kode: '1002', nama: 'Bank', debit: bank > 0 ? bank : 0, credit: bank < 0 ? Math.abs(bank) : 0 });
    if (piutang !== 0) neracaSaldoData.push({ kode: '1101', nama: 'Piutang Usaha', debit: piutang > 0 ? piutang : 0, credit: piutang < 0 ? Math.abs(piutang) : 0 });
    if (persediaan !== 0) neracaSaldoData.push({ kode: '1201', nama: 'Persediaan', debit: persediaan, credit: 0 });
    if (peralatan !== 0) neracaSaldoData.push({ kode: '1211', nama: 'Peralatan Usaha', debit: peralatan, credit: 0 });
    
    // 2xxx Liabilities (Credit)
    if (utang !== 0) neracaSaldoData.push({ kode: '2001', nama: 'Utang Usaha', debit: utang < 0 ? Math.abs(utang) : 0, credit: utang > 0 ? utang : 0 });
    
    // 3xxx Equity (Credit)
    if (modal !== 0) neracaSaldoData.push({ kode: '3001', nama: 'Modal Pemilik', debit: 0, credit: modal });
    if (prive !== 0) neracaSaldoData.push({ kode: '3101', nama: 'Prive', debit: prive, credit: 0 });
    
    // 4xxx Revenue (Credit)
    if (penjualan !== 0) neracaSaldoData.push({ kode: '4001', nama: 'Penjualan', debit: 0, credit: penjualan });
    if (diskonReturPenjualan !== 0) neracaSaldoData.push({ kode: '4002', nama: 'Retur/Diskon Penjualan', debit: diskonReturPenjualan, credit: 0 });
    
    // 5xxx COGS (Debit)
    if (hpp !== 0) neracaSaldoData.push({ kode: '5001', nama: 'Harga Pokok Penjualan', debit: hpp, credit: 0 });
    if (returPembelian !== 0) neracaSaldoData.push({ kode: '5002', nama: 'Retur Pembelian', debit: 0, credit: returPembelian });
    
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
    const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Initial Balances
    if (kodeAkun === '1001' && saldoKasAwal > 0) {
      balance = saldoKasAwal;
      mutasi.push({ id: 'init', date: formatDate(business?.createdAt || new Date()), ref: 'AWAL', description: 'Saldo Awal Kas', debit: balance, credit: 0, balance });
    } else if (kodeAkun === '1002' && saldoBankAwal > 0) {
      balance = saldoBankAwal;
      mutasi.push({ id: 'init', date: formatDate(business?.createdAt || new Date()), ref: 'AWAL', description: 'Saldo Awal Bank', debit: balance, credit: 0, balance });
    } else if (kodeAkun === '3001' && (saldoKasAwal + saldoBankAwal) > 0) {
      balance = saldoKasAwal + saldoBankAwal;
      mutasi.push({ id: 'init', date: formatDate(business?.createdAt || new Date()), ref: 'AWAL', description: 'Modal Awal', debit: 0, credit: balance, balance });
    }

    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amount = Number(t.amount);
      const isBank = getIsBank(t.payment_method);
      const isUtang = getIsUtang(t.payment_method);
      
      const kasAccountCode = isBank ? '1002' : '1001';
      const entries: {accountCode: string, debit: number, credit: number}[] = [];

      switch(type) {
        case 'penjualan':
          if (isUtang) entries.push({ accountCode: '1101', debit: amount, credit: 0 });
          else entries.push({ accountCode: kasAccountCode, debit: amount, credit: 0 });
          entries.push({ accountCode: '4001', debit: 0, credit: amount });
          break;
        case 'pembelian_barang':
          entries.push({ accountCode: '5001', debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, debit: 0, credit: amount });
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
        case 'transaksi_lainnya':
          let bebanCode = '6004';
          const desc = t.description?.toLowerCase() || '';
          if (desc.includes('gaji')) bebanCode = '6001';
          else if (desc.includes('listrik') || desc.includes('air')) bebanCode = '6002';
          else if (desc.includes('sewa')) bebanCode = '6003';
          
          entries.push({ accountCode: bebanCode, debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, debit: 0, credit: amount });
          break;
        case 'terima_pembayaran':
          entries.push({ accountCode: kasAccountCode, debit: amount, credit: 0 });
          entries.push({ accountCode: '1101', debit: 0, credit: amount });
          break;
        case 'bayar_utang':
        case 'bayar_cicilan':
          entries.push({ accountCode: '2001', debit: amount, credit: 0 });
          entries.push({ accountCode: kasAccountCode, debit: 0, credit: amount });
          break;
        case 'terima_pinjaman':
          entries.push({ accountCode: kasAccountCode, debit: amount, credit: 0 });
          entries.push({ accountCode: '2001', debit: 0, credit: amount });
          break;
        case 'tambah_modal':
          entries.push({ accountCode: kasAccountCode, debit: amount, credit: 0 });
          entries.push({ accountCode: '3001', debit: 0, credit: amount });
          break;
        case 'prive':
          entries.push({ accountCode: '3101', debit: amount, credit: 0 });
          entries.push({ accountCode: kasAccountCode, debit: 0, credit: amount });
          break;
        case 'beli_aset':
          entries.push({ accountCode: '1211', debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, debit: 0, credit: amount });
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          entries.push({ accountCode: '4002', debit: amount, credit: 0 });
          if (!isUtang) entries.push({ accountCode: kasAccountCode, debit: 0, credit: amount });
          else entries.push({ accountCode: '1101', debit: 0, credit: amount });
          break;
        case 'retur_pembelian':
          if (!isUtang) entries.push({ accountCode: kasAccountCode, debit: amount, credit: 0 });
          else entries.push({ accountCode: '2001', debit: amount, credit: 0 });
          entries.push({ accountCode: '5002', debit: 0, credit: amount });
          break;
        default:
          entries.push({ accountCode: '6004', debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, debit: 0, credit: amount });
          break;
      }

      const relevantEntries = entries.filter(e => e.accountCode === kodeAkun);
      if (relevantEntries.length > 0) {
        let totalDebit = 0;
        let totalCredit = 0;
        relevantEntries.forEach(e => {
          totalDebit += e.debit;
          totalCredit += e.credit;
        });

        if (['1001', '1002', '1101', '1201', '1211', '5001', '5002', '3101', '4002'].includes(kodeAkun as string) || (kodeAkun as string).startsWith('6')) {
          balance = balance + totalDebit - totalCredit; // Normal Balance Debit
        } else {
          balance = balance + totalCredit - totalDebit; // Normal Balance Credit
        }

        mutasi.push({
          id: t.id,
          date: formatDate(t.date),
          ref: t.trx_id || `TRX-${t.id.toString().substring(0,6)}`,
          description: t.description || 'Transaksi',
          debit: totalDebit,
          credit: totalCredit,
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
    const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    transactions.forEach(t => {
      const type = (t.type || '').toLowerCase();
      const amount = Number(t.amount);
      const isBank = getIsBank(t.payment_method);
      const isUtang = getIsUtang(t.payment_method);
      
      const kasAccountCode = isBank ? '1002' : '1001';
      const kasAccountName = isBank ? 'Bank' : 'Kas';
      const entries = [];

      switch(type) {
        case 'penjualan':
          if (isUtang) entries.push({ accountCode: '1101', accountName: 'Piutang Usaha', debit: amount, credit: 0 });
          else entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: amount, credit: 0 });
          entries.push({ accountCode: '4001', accountName: 'Penjualan', debit: 0, credit: amount });
          break;
        case 'pembelian_barang':
          entries.push({ accountCode: '5001', accountName: 'Harga Pokok Penjualan', debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: 0, credit: amount });
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
        case 'transaksi_lainnya':
          let bebanCode = '6004';
          let bebanName = 'Beban Lain-lain';
          const desc = t.description?.toLowerCase() || '';
          if (desc.includes('gaji')) { bebanCode = '6001'; bebanName = 'Beban Gaji'; }
          else if (desc.includes('listrik') || desc.includes('air')) { bebanCode = '6002'; bebanName = 'Beban Listrik & Air'; }
          else if (desc.includes('sewa')) { bebanCode = '6003'; bebanName = 'Beban Sewa'; }
          else if (t.description) { bebanName = t.description; }

          entries.push({ accountCode: bebanCode, accountName: bebanName, debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: 0, credit: amount });
          break;
        case 'terima_pembayaran':
          entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: amount, credit: 0 });
          entries.push({ accountCode: '1101', accountName: 'Piutang Usaha', debit: 0, credit: amount });
          break;
        case 'bayar_utang':
        case 'bayar_cicilan':
          entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: amount, credit: 0 });
          entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: 0, credit: amount });
          break;
        case 'terima_pinjaman':
          entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: amount, credit: 0 });
          entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: 0, credit: amount });
          break;
        case 'tambah_modal':
          entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: amount, credit: 0 });
          entries.push({ accountCode: '3001', accountName: 'Modal Pemilik', debit: 0, credit: amount });
          break;
        case 'prive':
          entries.push({ accountCode: '3101', accountName: 'Prive', debit: amount, credit: 0 });
          entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: 0, credit: amount });
          break;
        case 'beli_aset':
          entries.push({ accountCode: '1211', accountName: 'Peralatan Usaha', debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: 0, credit: amount });
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          entries.push({ accountCode: '4002', accountName: 'Retur/Diskon Penjualan', debit: amount, credit: 0 });
          if (!isUtang) entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: 0, credit: amount });
          else entries.push({ accountCode: '1101', accountName: 'Piutang Usaha', debit: 0, credit: amount });
          break;
        case 'retur_pembelian':
          if (!isUtang) entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: amount, credit: 0 });
          else entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: amount, credit: 0 });
          entries.push({ accountCode: '5002', accountName: 'Retur Pembelian', debit: 0, credit: amount });
          break;
        default:
          entries.push({ accountCode: '6004', accountName: `Beban Tidak Dikenal (${type})`, debit: amount, credit: 0 });
          if (isUtang) entries.push({ accountCode: '2001', accountName: 'Utang Usaha', debit: 0, credit: amount });
          else entries.push({ accountCode: kasAccountCode, accountName: kasAccountName, debit: 0, credit: amount });
          break;
      }

      if (entries.length > 0) {
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

        jurnalData.push({
          id: t.id,
          date: formatDate(t.date),
          ref: t.trx_id || `JV-${t.id.toString().substring(0,6).toUpperCase()}`,
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
