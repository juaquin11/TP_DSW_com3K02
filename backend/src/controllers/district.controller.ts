import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const listDistricts = async (req: Request, res: Response) => {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(districts);
  } catch (err: any) {
    console.error('Error listando distritos:', err);
    res.status(500).json({ error: 'No se pudieron obtener los distritos.' });
  }
};