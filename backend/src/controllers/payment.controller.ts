// backend/src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { stripe } from '../config/stripe'; // Asumiendo que inicializaste stripe aquí
import prisma from '../prisma/client';
import { JwtPayload } from '../models/types';

// --- Controlador para Stripe ---
export async function createStripeCheckoutSession(req: Request, res: Response) {
  try {
    const user = (req as any).user as JwtPayload;
    const { subscriptionId } = req.body; // El ID del plan que viene del frontend

    if (!subscriptionId) {
      return res.status(400).json({ error: 'El ID de la suscripción es requerido.' });
    }

    // 1. Busca los detalles del plan en tu BD
    const subscriptionPlan = await prisma.subscription.findUnique({
      where: { id_subscription: subscriptionId },
    });

    if (!subscriptionPlan) {
      return res.status(404).json({ error: 'Plan de suscripción no encontrado.' });
    }

    // 2. Define las URLs de éxito y cancelación (del Frontend)
    const YOUR_DOMAIN = 'http://localhost:5173'; // Cambia esto en producción

    // 3. Crea la Sesión de Checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ars', // Moneda (Pesos Argentinos)
            product_data: {
              name: `Suscripción: ${subscriptionPlan.plan_name}`,
              // Puedes añadir descripción e imágenes aquí si quieres
              // description: 'Acceso mensual a beneficios...',
              // images: ['url_a_imagen_del_plan'],
            },
            unit_amount: Math.round(Number(subscriptionPlan.price) * 100), // Precio en centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Cambia a 'subscription' si manejas suscripciones recurrentes directamente con Stripe Products/Prices
      success_url: `${YOUR_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`, // Stripe reemplazará {CHECKOUT_SESSION_ID}
      cancel_url: `${YOUR_DOMAIN}/payment-cancel`,
      // (Opcional) Guarda info para identificar al usuario o la compra después
      metadata: {
        userId: user.id_user,
        subscriptionId: subscriptionPlan.id_subscription,
      },
      // (Opcional) Puedes pre-rellenar el email del cliente
      // customer_email: userEmailFromDB,
    });

    // 4. Devuelve el ID de la sesión al frontend
    res.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Error al crear la sesión de checkout de Stripe:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}

// --- (Opcional) Controlador para Webhooks ---
// export async function handleStripeWebhook(req: Request, res: Response) {
//   const sig = req.headers['stripe-signature'];
//   let event;
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!; // Necesitas configurar esto en Stripe y .env

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
//   } catch (err: any) {
//     console.log(`⚠️  Webhook signature verification failed.`, err.message);
//     return res.sendStatus(400);
//   }

//   // Maneja el evento
//   switch (event.type) {
//     case 'checkout.session.completed':
//       const session = event.data.object;
//       console.log('CheckoutSession completed:', session);
//       // Aquí actualizas tu base de datos:
//       // const userId = session.metadata?.userId;
//       // const subscriptionId = session.metadata?.subscriptionId;
//       // await updateSubscriptionStatus(userId, subscriptionId, 'active');
//       break;
//     // ... maneja otros tipos de eventos si es necesario
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Devuelve una respuesta 200 a Stripe para confirmar la recepción
//   res.json({ received: true });
// }