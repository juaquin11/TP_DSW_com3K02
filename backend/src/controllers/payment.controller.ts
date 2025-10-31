// backend/src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import { stripe } from '../config/stripe'; // Asegúrate que la ruta sea correcta
import prisma from '../prisma/client';
import { JwtPayload } from '../models/types';
import dotenv from 'dotenv'; 
import Stripe from 'stripe'; 


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


export async function handleStripeWebhook(req: Request, res: Response) {
  
  // LOG 1: ¿Llegó la petición?
  console.log('--- WEBHOOK /api/payments/webhook RECIBIDO ---'); 
  
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    // LOG 2: Error de configuración
    console.error('--- WEBHOOK ERROR: Falta signature o secret en .env ---');
    return res.status(400).send('Webhook Error: Missing secret or signature.');
  }
  
  // LOG 3: ¿Se leyeron las claves?
  console.log('--- WEBHOOK: Firma y Secret encontrados. Intentando verificar... ---');

  let event: Stripe.Event;

  try {
    // 4. Verificar firma
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    // LOG 5: ¡LA FIRMA FALLÓ!
    console.error(`--- WEBHOOK ERROR: VERIFICACIÓN DE FIRMA FALLIDA! ---`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // LOG 6: ¡Éxito en la firma!
  console.log(`--- WEBHOOK ÉXITO: Firma verificada. Evento: ${event.type} ---`);

  // 7. Manejar el evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // LOG 7: Evento correcto
    console.log(`--- WEBHOOK: Procesando checkout.session.completed para session ${session.id} ---`);

    const userId = session.metadata?.userId;
    const subscriptionId = session.metadata?.subscriptionId;

    if (!userId || !subscriptionId) {
      // LOG 8: Error en metadata
      console.error('--- WEBHOOK ERROR: Faltan metadata (userId o subscriptionId) en la sesión. ---');
      return res.status(400).send('Error: Missing metadata in session.');
    }

    // LOG 9: Metadata OK
    console.log(`--- WEBHOOK: Metadata OK. UserID: ${userId}, SubscriptionID: ${subscriptionId} ---`);

    try {
      const plan = await prisma.subscription.findUnique({
        where: { id_subscription: subscriptionId },
      });

      if (!plan) {
        // LOG 10: Error, no se encontró el plan
        console.error(`--- WEBHOOK ERROR: Plan con ID ${subscriptionId} no encontrado en la BD. ---`);
        throw new Error(`Plan with ID ${subscriptionId} not found.`);
      }

      // LOG 11: Plan OK
      console.log(`--- WEBHOOK: Plan encontrado: ${plan.plan_name}, Duración: ${plan.duration} días ---`);

      const adhesionDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(adhesionDate.getDate() + plan.duration);

      // LOG 12: A punto de escribir en la BD
      console.log(`--- WEBHOOK: Intentando 'upsert' en has_subscription para usuario ${userId} ---`);

      // 
      // Revisa tu migración 20251015235210_updated_subscription_model/migration.sql
      // Agregaste `expiry_date` (NOT NULL), `last_payment_id` (NULL), `status` (NOT NULL DEFAULT 'active')
      //
      await prisma.has_subscription.upsert({
        where: { id_client: userId }, 
        update: {
          id_subscription: subscriptionId,
          adhesion_date: adhesionDate,
          expiry_date: expiryDate, // <-- ¡CAMPO IMPORTANTE AÑADIDO!
          status: 'active',        // <-- ¡CAMPO IMPORTANTE AÑADIDO!
          last_payment_id: session.payment_intent as string | null, // <-- ¡CAMPO IMPORTANTE AÑADIDO!
        },
        create: {
          id_client: userId,
          id_subscription: subscriptionId,
          adhesion_date: adhesionDate,
          expiry_date: expiryDate, // <-- ¡CAMPO IMPORTANTE AÑADIDO!
          status: 'active',        // <-- ¡CAMPO IMPORTANTE AÑADIDO!
          last_payment_id: session.payment_intent as string | null, // <-- ¡CAMPO IMPORTANTE AÑADIDO!
        },
      });
      
      // LOG 13: ¡ÉXITO TOTAL!
      console.log(`--- WEBHOOK ÉXITO: 'has_subscription' guardada para usuario ${userId} ---`);

    } catch (dbError: any) {
      // LOG 14: Error de base de datos
      console.error("--- WEBHOOK ERROR: Error de base de datos ---", dbError);
      return res.status(500).send('Internal server error while updating subscription.');
    }
  } else {
    // LOG 15: Evento no manejado
    console.log(`--- WEBHOOK: Evento ${event.type} recibido, pero no se maneja. ---`);
  }

  // 8. Enviar respuesta 200 a Stripe
  res.json({ received: true });
}