import { Router } from 'express';
import * as dishController from '../controllers/dishCRUD.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { 
  validateCreateDish, 
  validateUpdateDish, 
  validateDishParams 
} from '../middlewares/dishCRUD.middleware';

const router = Router();


//router.use(requireAuth);

// POST /api/dishes - Crear un nuevo plato
router.post('/', validateCreateDish, dishController.createDish);

// GET /api/dishes - Obtener todos los platos
router.get('/', dishController.getAllDishes);

// GET /api/dishes/restaurant/:id_restaurant - Obtener todos los platos de un restaurante
router.get('/restaurant/:id_restaurant', dishController.getDishesByRestaurant);

// GET /api/dishes/:dish_name/:id_restaurant - Obtener un plato específico
router.get('/:dish_name/:id_restaurant', validateDishParams, dishController.getDish);

// PUT /api/dishes/:dish_name/:id_restaurant - Actualizar un plato
router.put('/:dish_name/:id_restaurant', validateUpdateDish, dishController.updateDish);

// DELETE /api/dishes/:dish_name/:id_restaurant - Eliminar un plato
router.delete('/:dish_name/:id_restaurant', validateDishParams, dishController.deleteDish);

export default router;