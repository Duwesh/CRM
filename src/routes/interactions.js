import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as MiscController from '../controllers/miscController.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', MiscController.listAllInteractions);
router.get('/client/:clientId', MiscController.listInteractions);
router.post('/', MiscController.createInteraction);
router.put('/:id', MiscController.updateInteraction);
router.delete('/:id', MiscController.deleteInteraction);

export default router;

