import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/status', requireAuth, userController.getUserStatus);

router.get('/profile', requireAuth, userController.getProfile);

router.patch('/profile', requireAuth, userController.updateProfile);

export default router;
