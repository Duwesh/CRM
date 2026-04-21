import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as EngagementController from '../controllers/billingControllers.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', EngagementController.listEngagements);
router.post('/', EngagementController.createEngagement);
router.patch('/:id', EngagementController.updateEngagement);
router.delete('/:id', EngagementController.deleteEngagement);

export default router;

