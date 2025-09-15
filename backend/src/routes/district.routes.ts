import { Router } from 'express';
import * as districtController from '../controllers/district.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint para que el frontend obtenga la lista de distritos
router.get('/', requireAuth, districtController.listDistricts);

export default router;