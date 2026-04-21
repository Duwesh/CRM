import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as ClientController from '../controllers/clientController.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', ClientController.listClients);
router.get('/stats', ClientController.getClientStats);
router.post('/', ClientController.createClient);
router.get('/:id', ClientController.getClient);
router.put('/:id', ClientController.updateClient);
router.patch('/:id', ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);

export default router;

