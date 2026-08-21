import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { q, page, limit } = req.query;
    
    let whereClause: any = { userId };
    
    if (q && typeof q === 'string' && q.trim() !== '') {
      whereClause = {
        userId,
        OR: [
          { description: { contains: q } },
          { trx_id: { contains: q } },
          { type: { contains: q } },
        ]
      };
    }

    if (page && limit) {
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: whereClause,
          orderBy: { date: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.transaction.count({ where: whereClause })
      ]);

      res.json({
        data: transactions,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } else {
      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
      });
      res.json(transactions);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const transaction = await prisma.transaction.findFirst({
      where: { id: Number(id), userId },
    });
    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transaction', error });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { trx_id, type, date, amount, payment_method, description, metadata } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        trx_id,
        type,
        date: new Date(date),
        amount,
        payment_method,
        description,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
    });

    // Sync stock for Penjualan
    if (type === 'Penjualan' && metadata) {
      try {
        const metaObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        if (metaObj.productId && metaObj.jumlah) {
          const qty = parseInt(String(metaObj.jumlah).replace(/\D/g, ''), 10);
          if (qty > 0) {
            await prisma.product.update({
              where: { id: Number(metaObj.productId) },
              data: { stock: { decrement: qty } }
            });
          }
        }
      } catch (err) {
        console.error('Failed to sync stock on create:', err);
      }
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction', error });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({ where: { id: Number(id), userId } });
    if (!existing) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    // Sync stock for Penjualan (Restore stock)
    if (existing.type === 'Penjualan' && existing.metadata) {
      try {
        const metaObj = JSON.parse(existing.metadata);
        if (metaObj.productId && metaObj.jumlah) {
          const qty = parseInt(String(metaObj.jumlah).replace(/\D/g, ''), 10);
          if (qty > 0) {
            await prisma.product.update({
              where: { id: Number(metaObj.productId) },
              data: { stock: { increment: qty } }
            });
          }
        }
      } catch (err) {
        console.error('Failed to sync stock on delete:', err);
      }
    }

    await prisma.transaction.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction', error });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { trx_id, type, date, amount, payment_method, description, metadata } = req.body;
    const existing = await prisma.transaction.findUnique({ where: { id: Number(id) } });

    const transaction = await prisma.transaction.update({
      where: { id: Number(id) },
      data: {
        trx_id,
        type,
        date: new Date(date),
        amount,
        payment_method,
        description,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
    });

    // Sync stock for Penjualan UPDATE
    if (existing && existing.type === 'Penjualan' && existing.metadata) {
      try {
        const oldMeta = JSON.parse(existing.metadata);
        if (oldMeta.productId && oldMeta.jumlah) {
          const oldQty = parseInt(String(oldMeta.jumlah).replace(/\D/g, ''), 10);
          if (oldQty > 0) {
            await prisma.product.update({
              where: { id: Number(oldMeta.productId) },
              data: { stock: { increment: oldQty } }
            });
          }
        }
      } catch (err) {
        console.error('Failed to restore old stock on update:', err);
      }
    }

    if (type === 'Penjualan' && metadata) {
      try {
        const newMeta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        if (newMeta.productId && newMeta.jumlah) {
          const newQty = parseInt(String(newMeta.jumlah).replace(/\D/g, ''), 10);
          if (newQty > 0) {
            await prisma.product.update({
              where: { id: Number(newMeta.productId) },
              data: { stock: { decrement: newQty } }
            });
          }
        }
      } catch (err) {
        console.error('Failed to deduct new stock on update:', err);
      }
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction', error });
  }
};


export const resetTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find all Penjualan transactions to revert stock
    const penjualanTxs = await prisma.transaction.findMany({
      where: { userId, type: 'Penjualan' }
    });

    for (const tx of penjualanTxs) {
      if (tx.metadata) {
        try {
          const metaObj = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
          if (metaObj.productId && metaObj.jumlah) {
            const qty = parseInt(String(metaObj.jumlah).replace(/\D/g, ''), 10);
            if (qty > 0) {
              await prisma.product.update({
                where: { id: Number(metaObj.productId) },
                data: { stock: { increment: qty } }
              }).catch(e => console.error('Failed to revert stock during reset:', e));
            }
          }
        } catch (e) {}
      }
    }

    await prisma.transaction.deleteMany({
      where: { userId }
    });

    res.json({ message: 'All transactions reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset transactions', error });
  }
};
