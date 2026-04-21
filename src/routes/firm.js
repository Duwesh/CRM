import { Router } from 'express';
import * as FirmController from '../controllers/firmController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.patch('/', FirmController.updateFirm);

export default router;
