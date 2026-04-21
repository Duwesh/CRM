import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as MiscController from '../controllers/miscController.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', MiscController.listReminders);
router.post('/', MiscController.createReminder);
router.put('/:id', MiscController.updateReminder);
router.delete('/:id', MiscController.deleteReminder);
router.patch('/:id/toggle', MiscController.toggleReminder);

export default router;

