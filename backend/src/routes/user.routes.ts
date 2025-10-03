import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint protegido para el estado actual del usuario logueado.
router.get('/status', requireAuth, userController.getUserStatus);

export default router;
