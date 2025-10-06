import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/client/:id_user  -- Obtener la subscripcion de un cliente
router.get('/client/:id_user', subscriptionController.CtrlGetSubscriptionByClient);

// Endpoint para que el frontend obtenga la lista de suscripciones
router.get('/', requireAuth, subscriptionController.listSubscriptions);



export default router;
