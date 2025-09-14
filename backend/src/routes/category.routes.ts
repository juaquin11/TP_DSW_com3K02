import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Protegemos la ruta para que solo usuarios logueados puedan verla
router.get('/', requireAuth, categoryController.listCategories);

export default router;