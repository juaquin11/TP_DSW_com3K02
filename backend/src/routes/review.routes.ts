import { Router } from 'express';
import { getRestaurantReviews } from '../controllers/review.controller';

const router = Router();

// Ruta pública para obtener reseñas de un restaurante
router.get('/byrestaurant/:restaurantId', getRestaurantReviews);

export default router;
