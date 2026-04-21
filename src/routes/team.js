import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as TeamController from '../controllers/teamController.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', requireRole('owner', 'admin'), TeamController.listTeamMembers);
router.post('/', requireRole('owner', 'admin'), TeamController.addTeamMember);
router.patch('/:id', requireRole('owner', 'admin'), TeamController.updateTeamMember);
router.delete('/:id', requireRole('owner', 'admin'), TeamController.deleteTeamMember);

export default router;

