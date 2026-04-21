import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as MiscController from '../controllers/miscController.js';
import { upload } from '../services/uploadService.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/profile', MiscController.getFirmProfile);
router.put('/profile', requireRole('owner', 'admin'), MiscController.updateFirmProfile);
router.post('/upload-logo', requireRole('owner', 'admin'), upload.single('logo'), MiscController.uploadLogo);
router.post('/invite', requireRole('owner', 'admin'), MiscController.invite);

export default router;

