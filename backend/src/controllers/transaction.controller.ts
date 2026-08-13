import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(id) },
    });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transaction', error });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { trx_id, type, date, amount, payment_method, description, metadata } = req.body;
    
    // Find a valid user or create a default one to avoid P2003 foreign key error
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Default User",
          email: "default_" + Date.now() + "@example.com",
          password: "password123"
        }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        trx_id,
        type,
        date: new Date(date),
        amount,
        payment_method,
        description,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
        userId: user.id,
      },
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction', error });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Default User",
          email: "default_" + Date.now() + "@example.com",
          password: "password123"
        }
      });
    }

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
        userId: user.id,
      },
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction', error });
  }
};
