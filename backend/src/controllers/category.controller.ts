import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err: any) {
    console.error('Error listando categorías', err);
    res.status(500).json({ error: 'No se pudieron obtener las categorías.' });
  }
};