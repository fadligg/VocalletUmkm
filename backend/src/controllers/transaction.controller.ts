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
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction', error });
  }
};
