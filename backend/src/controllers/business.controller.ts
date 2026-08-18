import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export const setupBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      namaUsaha,
      jenisUsaha,
      noTelp,
      alamat,
      tahunMulai,
      tahunAkhir,
      saldoKas,
      saldoBank,
      logoUrl
    } = req.body;

    if (!namaUsaha || !jenisUsaha || !tahunMulai || !tahunAkhir) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const business = await prisma.business.create({
      data: {
        userId,
        namaUsaha,
        jenisUsaha,
        noTelp: noTelp || null,
        alamat: alamat || null,
        tahunMulai: new Date(tahunMulai),
        tahunAkhir: new Date(tahunAkhir),
        saldoKas: parseFloat(saldoKas) || 0,
        saldoBank: parseFloat(saldoBank) || 0,
        logoUrl: logoUrl || null
      }
    });

    res.status(201).json({ message: 'Business setup successful', business });
  } catch (error: any) {
    console.error('Setup business error:', error);
    res.status(500).json({ error: 'Internal server error during business setup', details: error.message || error.toString() });
  }
};

export const getBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
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

    // Fetch transactions and products to calculate real stats
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
    
    // Mulai dengan saldo awal dari data business
    let kas = Number(business.saldoKas) || 0;
    let bank = Number(business.saldoBank) || 0;

    transactions.forEach(t => {
      const type = t.type;
      const amount = Number(t.amount);
      const isBank = t.payment_method === 'Transfer Bank' || t.payment_method === 'QRIS';
      const isUtang = t.payment_method === 'Utang' || t.payment_method === 'Kredit';

      const addCash = (val: number) => {
        if (isBank) {
          bank += val;
        } else {
          kas += val;
        }
      };
      
      switch (type) {
        case 'penjualan':
          pendapatan += amount;
          if (isUtang) piutang += amount;
          else addCash(amount);
          break;
        case 'diskon_penjualan':
        case 'retur_penjualan':
          pendapatan -= amount;
          if (!isUtang) addCash(-amount);
          break;
        case 'pembelian_barang':
          if (isUtang) utang += amount;
          else addCash(-amount);
          break;
        case 'retur_pembelian':
          beban -= amount;
          if (!isUtang) addCash(amount);
          break;
        case 'bayar_beban':
        case 'bayar_ongkir':
        case 'barang_rusak':
          beban += amount;
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

    res.status(200).json({ business, stats });
  } catch (error: any) {
    console.error('Get business error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message || error.toString() });
  }
};

export const updateBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      namaUsaha,
      jenisUsaha,
      noTelp,
      alamat,
      tahunMulai,
      tahunAkhir,
      tarifPajak,
      stokNegatif,
      logoUrl
    } = req.body;

    const existingBusiness = await prisma.business.findFirst({
      where: { userId },
      orderBy: { id: 'desc' }
    });

    if (!existingBusiness) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    const business = await prisma.business.update({
      where: { id: existingBusiness.id },
      data: {
        namaUsaha,
        jenisUsaha,
        noTelp: noTelp || null,
        alamat: alamat || null,
        tahunMulai: tahunMulai ? new Date(tahunMulai) : existingBusiness.tahunMulai,
        tahunAkhir: tahunAkhir ? new Date(tahunAkhir) : existingBusiness.tahunAkhir,
        tarifPajak: tarifPajak ? parseFloat(tarifPajak) : existingBusiness.tarifPajak,
        stokNegatif: stokNegatif !== undefined ? stokNegatif : existingBusiness.stokNegatif,
        logoUrl: logoUrl !== undefined ? logoUrl : existingBusiness.logoUrl
      }
    });

    res.status(200).json({ message: 'Business updated successfully', business });
  } catch (error: any) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message || error.toString() });
  }
};
