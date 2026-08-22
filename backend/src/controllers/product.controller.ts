import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { invalidateUserCache } from '../lib/cache';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: Number(id), userId },
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { name, brand, sku, unit, minStock, priceBuy, priceSell, stock, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: {
        userId,
        name,
        brand,
        sku,
        unit: unit || 'pcs',
        minStock: Number(minStock) || 0,
        priceBuy,
        priceSell,
        stock: Number(stock) || 0,
        imageUrl,
      },
    });
    
    invalidateUserCache(userId);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const { name, brand, sku, unit, minStock, priceBuy, priceSell, stock, imageUrl } = req.body;
    
    const existing = await prisma.product.findFirst({ where: { id: Number(id), userId } });
    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        brand,
        sku,
        unit,
        minStock: minStock !== undefined ? Number(minStock) : undefined,
        priceBuy,
        priceSell,
        stock: stock !== undefined ? Number(stock) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      },
    });
    
    invalidateUserCache(userId);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;

    const existing = await prisma.product.findFirst({ where: { id: Number(id), userId } });
    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });
    
    invalidateUserCache(userId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error });
  }
};
