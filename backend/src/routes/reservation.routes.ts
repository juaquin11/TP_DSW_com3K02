import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de reservas requieren que el usuario esté logueado
router.use(requireAuth);

// Obtener las reservas de hoy para un restaurante específico
router.get('/restaurant/:id/today', reservationController.getTodayReservations);

// Actualizar el estado de una reserva específica
router.patch('/:id/status', reservationController.updateStatus);

export default router;