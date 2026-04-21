import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as LeadController from '../controllers/leadController.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', LeadController.listLeads);
router.post('/', LeadController.createLead);
router.patch('/:id', LeadController.updateLead);
router.delete('/:id', LeadController.deleteLead);

export default router;

