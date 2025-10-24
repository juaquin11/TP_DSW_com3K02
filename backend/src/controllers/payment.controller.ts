// backend/src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { stripe } from '../config/stripe'; // Asegúrate que la ruta sea correcta
import prisma from '../prisma/client';
import { JwtPayload } from '../models/types';
import dotenv from 'dotenv'; // Asegúrate de importar dotenv si usas process.env aquí

dotenv.config(); // Carga las variables de entorno

// --- Controlador para Stripe ---
export async function createStripeCheckoutSession(req: Request, res: Response) {
  console.log("Recibida petición para crear sesión de Stripe..."); // Log 1
  try {
    const user = (req as any).user as JwtPayload;
    const { subscriptionId } = req.body; // El ID del plan que viene del frontend
    console.log("UserID:", user.id_user, "SubscriptionID recibido:", subscriptionId); // Log 2

    if (!subscriptionId) {
      return res.status(400).json({ error: 'El ID de la suscripción es requerido.' });
    }

    console.log("Buscando plan en DB..."); // Log 3
    const subscriptionPlan = await prisma.subscription.findUnique({
      where: { id_subscription: subscriptionId },
    });
    console.log("Plan encontrado:", subscriptionPlan); // Log 4

    if (!subscriptionPlan) {
      return res.status(404).json({ error: 'Plan de suscripción no encontrado.' });
    }

    const unitAmount = Math.round(Number(subscriptionPlan.price) * 100);
    console.log("Calculado unit_amount (centavos):", unitAmount); // Log 5
    if (isNaN(unitAmount)) {
        throw new Error('El precio del plan no es un número válido.');
    }

    // Define las URLs de éxito y cancelación (del Frontend)
    // Asegúrate de que esta URL base sea correcta para tu entorno (desarrollo/producción)
    const YOUR_DOMAIN = process.env.FRONTEND_URL || 'http://localhost:5173';

    console.log("Creando sesión en Stripe..."); // Log 6
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Cambiado a USD como solicitaste para probar
            product_data: {
              name: `Suscripción: ${subscriptionPlan.plan_name}`,
              // Puedes añadir descripción e imágenes aquí si quieres
              // description: 'Acceso mensual a beneficios...',
              // images: ['url_a_imagen_del_plan'],
            },
            unit_amount: unitAmount, // Precio en centavos de USD
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
      // (Opcional) Puedes pre-rellenar el email del cliente si lo tienes
      // customer_email: user.email, // Asumiendo que tienes el email en JwtPayload o lo buscas
    });
    console.log("Sesión de Stripe creada:", session.id); // Log 7

    // --- CAMBIO CLAVE AQUÍ ---
    // Devuelve la URL completa de la sesión de checkout
    if (!session.url) {
        throw new Error("Stripe no devolvió una URL para la sesión de checkout.");
    }
    res.json({ url: session.url });
    // -------------------------

  } catch (error: any) {
    // --- Log de Error Detallado ---
    console.error('Error DETALLADO al crear la sesión de checkout de Stripe:', error); // Log 8 (Error)
    // Devuelve un mensaje genérico o el específico si es seguro
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor.';
    res.status(500).json({ error: errorMessage });
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