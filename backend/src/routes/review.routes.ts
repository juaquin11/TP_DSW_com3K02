import { Router } from 'express';
import { getRestaurantReviews, postReview } from '../controllers/review.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/byrestaurant/:restaurantId', getRestaurantReviews);

router.post('/', requireAuth, postReview);

export default router;
