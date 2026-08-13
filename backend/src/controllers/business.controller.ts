import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

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
      saldoBank
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
      where: { userId }
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

    transactions.forEach(t => {
      const type = t.type.toLowerCase();
      const amount = Number(t.amount);
      
      if (type.includes('pemasukan') || type.includes('penjualan') || type === 'income') {
        pendapatan += amount;
      } else if (type.includes('pengeluaran') || type.includes('pembelian') || type.includes('beban') || type === 'expense') {
        beban += amount;
      } else if (type.includes('piutang')) {
        piutang += amount;
      } else if (type.includes('utang')) {
        utang += amount;
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
      nilaiPersediaan
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
      stokNegatif
    } = req.body;

    const existingBusiness = await prisma.business.findFirst({
      where: { userId }
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
        stokNegatif: stokNegatif !== undefined ? stokNegatif : existingBusiness.stokNegatif
      }
    });

    res.status(200).json({ message: 'Business updated successfully', business });
  } catch (error: any) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message || error.toString() });
  }
};
