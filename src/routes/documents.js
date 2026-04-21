import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as MiscController from '../controllers/miscController.js';
import { upload } from '../services/uploadService.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', MiscController.listAllDocuments);
router.get('/categories', MiscController.listDocumentCategories);
router.post('/', MiscController.createDocument);
router.patch('/:id', MiscController.updateDocument);
router.delete('/:id', MiscController.deleteDocument);
router.get('/:clientId', MiscController.listDocuments);

export default router;

