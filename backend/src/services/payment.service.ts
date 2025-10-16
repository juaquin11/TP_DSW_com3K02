// backend/src/services/payment.service.ts

import { MercadoPagoConfig, Preference } from 'mercadopago';
import prisma from '../prisma/client';

// Inicializamos el cliente de Mercado Pago con tu credencial del .env
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function createSubscriptionPreference(subscriptionId: string, userId: string) {
  // 1. Buscamos los detalles del plan en nuestra base de datos
  const subscriptionPlan = await prisma.subscription.findUnique({
    where: { id_subscription: subscriptionId },
  });

  if (!subscriptionPlan) {
    throw new Error('Plan de suscripción no encontrado');
  }

  // 2. Creamos el objeto "Preferencia" que describe la venta
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          id: subscriptionPlan.id_subscription,
          title: `Suscripción: ${subscriptionPlan.plan_name}`,
          quantity: 1,
          unit_price: Number(subscriptionPlan.price),
          currency_id: 'ARS', // Moneda local
        },
      ],
      // URLs a las que se redirigirá al usuario después del pago
      back_urls: {
        success: 'http://localhost:5173/profile?payment_status=success',
        failure: 'http://localhost:5173/profile?payment_status=failure',
        pending: 'http://localhost:5173/profile?payment_status=pending',
      },
      auto_return: 'approved', // Redirige automáticamente si el pago es aprobado

      // Guardamos el ID de nuestro usuario. Así sabremos quién pagó
      // cuando Mercado Pago nos notifique del pago exitoso.
      external_reference: userId,
    },
  });

  // 3. Devolvemos el resultado que contiene la URL de pago
  return result;
}