import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';

const router = Router();

// GET /api/restaurants
router.get('/', restaurantController.listRestaurants);

export default router;
