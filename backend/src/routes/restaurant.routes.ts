import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
// import { requireAuth } from '../middlewares/auth.middleware'; // Importa el middleware

const router = Router();

router.get('/', restaurantController.listRestaurants);

export default router;