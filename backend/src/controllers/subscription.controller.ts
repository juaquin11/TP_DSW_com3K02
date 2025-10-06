import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { getSubscriptionByClient } from '../services/subscription.service';

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
export const CtrlGetSubscriptionByClient = async (req: Request, res: Response) => {
  try {
    const id_user = req.params.id_user;

    if (!id_user) {
      return res.status(400).json({ error: 'Se requiere id_usuario' });
    }

    const subscription = await getSubscriptionByClient(id_user);
    return res.status(200).json({
      data: subscription
    });
  } catch (err: any) {
    console.error('Error listando suscripcion:', err);
    res.status(500).json({ error: 'No se pudo obtener la subscripcion.' });
  }
};