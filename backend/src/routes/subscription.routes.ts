import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint para que el frontend obtenga la lista de suscripciones
router.get('/', requireAuth, subscriptionController.listSubscriptions);

export default router;