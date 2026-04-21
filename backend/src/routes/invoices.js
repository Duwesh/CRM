import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as InvoiceController from '../controllers/billingControllers.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/stats', InvoiceController.getInvoiceStats);
router.get('/', InvoiceController.listInvoices);
router.post('/', InvoiceController.createInvoice);
router.put('/:id', InvoiceController.updateInvoice);
router.delete('/:id', InvoiceController.deleteInvoice);

export default router;

