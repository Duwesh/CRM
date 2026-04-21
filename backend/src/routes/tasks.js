import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { enforceTenant } from '../middleware/tenant.js';
import * as TaskController from '../controllers/taskController.js';

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get('/', TaskController.listTasks);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;

