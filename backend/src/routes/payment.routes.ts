import express from 'express';
import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Ruta para crear una sesión de checkout de Stripe
router.post('/create-checkout-session', requireAuth, paymentController.createStripeCheckoutSession);

export default router;