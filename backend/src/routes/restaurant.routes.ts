import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
import { requireAuth } from '../middlewares/auth.middleware'; 
import { upload } from '../config/multer.config'; 


const router = Router();

router.get('/', restaurantController.listRestaurants);

// Ruta protegida para que solo el dueño vea sus restaurantes
router.get('/owner', requireAuth, restaurantController.listOwnerRestaurants);
router.post('/', requireAuth, upload.single('image'), restaurantController.createRestaurant);

export default router;