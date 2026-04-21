import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as DeadlineController from '../controllers/billingControllers.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', DeadlineController.listDeadlines);
router.post('/', DeadlineController.createDeadline);
router.patch('/:id', DeadlineController.updateDeadline);
router.delete('/:id', DeadlineController.deleteDeadline);

export default router;

