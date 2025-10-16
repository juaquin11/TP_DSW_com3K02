// backend/src/controllers/payment.controller.ts

import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { JwtPayload } from '../models/types';

export async function createPreference(req: Request, res: Response) {
  try {
    const user = (req as any).user as JwtPayload;
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'El ID de la suscripción es requerido.' });
    }

    const preference = await paymentService.createSubscriptionPreference(subscriptionId, user.id_user);

    // Devolvemos la URL de pago generada por Mercado Pago al frontend
    res.json({ init_point: preference.init_point });

  } catch (error: any) {
    console.error('Error al crear la preferencia de pago:', error);
    res.status(500).json({ error: error.message });
  }
}