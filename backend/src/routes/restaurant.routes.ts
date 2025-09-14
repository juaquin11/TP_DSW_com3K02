import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
import { requireAuth } from '../middlewares/auth.middleware'; // Importa el middleware

const router = Router();

router.get('/', restaurantController.listRestaurants);

// Ruta protegida para que solo el dueño vea sus restaurantes
router.get('/owner', requireAuth, restaurantController.listOwnerRestaurants);
router.post('/', requireAuth, restaurantController.createRestaurant);

export default router;