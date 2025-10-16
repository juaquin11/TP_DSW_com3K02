// backend/src/routes/payment.routes.ts

import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Esta ruta requiere que el usuario esté autenticado para poder pagar
router.post('/create-preference', requireAuth, paymentController.createPreference);

export default router;