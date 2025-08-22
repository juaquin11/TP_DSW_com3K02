import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
import { requireAuth } from '../middlewares/auth.middleware'; // Importa el middleware

const router = Router();

// GET /api/restaurants
router.get('/', restaurantController.listRestaurants); // Protege la ruta

export default router;