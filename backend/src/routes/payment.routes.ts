// backend/src/routes/payment.routes.ts
import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Ruta para crear una sesión de checkout de Stripe
router.post('/create-checkout-session', requireAuth, paymentController.createStripeCheckoutSession);

// (Opcional pero recomendado) Ruta para Webhooks de Stripe
// router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook);

export default router;