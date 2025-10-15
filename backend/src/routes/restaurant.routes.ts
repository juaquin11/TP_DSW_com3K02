import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../config/multer.config';

const router = Router();

// Rutas públicas
router.get('/', restaurantController.listRestaurants);

router.get('/search', restaurantController.searchRestaurants);

router.get('/with-discounts', restaurantController.listRestaurantsWithDiscounts);

// Rutas protegidas y específicas (deben ir antes que las dinámicas)
router.get('/owner', requireAuth, restaurantController.listOwnerRestaurants);

// Ruta dinámica (debe ir después de las específicas)
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/details', requireAuth, restaurantController.getRestaurantDetailsForOwner);
router.put('/:id', requireAuth, upload.single('image'), restaurantController.updateRestaurant);
router.delete('/:id', requireAuth, restaurantController.deleteRestaurant);


// Rutas de creación/modificación
router.post('/', requireAuth, upload.single('image'), restaurantController.createRestaurant);

export default router;
