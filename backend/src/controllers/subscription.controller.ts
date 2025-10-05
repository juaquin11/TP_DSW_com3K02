import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const listSubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { price: 'asc' },
    });
    res.json(subscriptions);
  } catch (err: any) {
    console.error('Error listando suscripciones:', err);
    res.status(500).json({ error: 'No se pudieron obtener las suscripciones.' });
  }
};