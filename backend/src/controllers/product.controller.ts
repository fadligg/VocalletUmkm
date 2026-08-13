import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, brand, sku, unit, minStock, priceBuy, priceSell, stock, imageUrl } = req.body;
    
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

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        sku,
        unit: unit || 'pcs',
        minStock: Number(minStock) || 0,
        priceBuy,
        priceSell,
        stock: Number(stock) || 0,
        imageUrl,
        userId: user.id
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, brand, sku, unit, minStock, priceBuy, priceSell, stock, imageUrl } = req.body;
    
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
        userId: user.id
      },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error });
  }
};
