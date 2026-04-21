import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import { getFeeSummary, updateClientFee } from '../controllers/billingControllers.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/summary', getFeeSummary);
router.patch('/client/:clientId', updateClientFee);

export default router;
