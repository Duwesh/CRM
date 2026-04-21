import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as ContactController from '../controllers/contactController.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', ContactController.listAllContacts);
router.post('/', ContactController.createContact); // Support creation with client_id in body
router.get('/:clientId', ContactController.listContacts);
router.post('/:clientId', ContactController.createContact);
router.patch('/:id', ContactController.updateContact);
router.delete('/:id', ContactController.deleteContact);

export default router;
