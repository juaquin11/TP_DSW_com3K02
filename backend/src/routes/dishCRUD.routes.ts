import { Router } from 'express';
import * as dishController from '../controllers/dishCRUD.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { upload } from '../config/multer.config'; 

import { 
  validateUpdateDish, 
  validateDishParams 
} from '../middlewares/dishCRUD.middleware';

const router = Router();

// Descomentar si se requiere autenticación para todas las rutas de platos
// router.use(requireAuth);   EN REVISION

// GET /api/dishes/restaurant/:id_restaurant/:id_subscription/discounts - Obtener platos con descuentos
router.get('/restaurant/:id_restaurant/discounts/:id_subscription', dishController.getDishesByRestaurantWithDiscounts);

router.post('/', requireAuth, upload.single('image'), dishController.createDish);

// router.post('/:dish_name/:id_restaurant/subscriptions', requireAuth, dishController.addDiscountSubscription);


router.get('/', dishController.getAllDishes);
router.get('/restaurant/:id_restaurant', dishController.getDishesByRestaurant);
router.get('/:dish_name/:id_restaurant', validateDishParams, dishController.getDish);

router.put('/:dish_name/:id_restaurant', requireAuth, upload.single('image'), dishController.updateDish);

router.delete('/:dish_name/:id_restaurant', validateDishParams, dishController.deleteDish);

export default router;