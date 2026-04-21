import { Router } from 'express';

import authRoutes from './auth.js';
import dashboardRoutes from './dashboard.js';
import clientRoutes from './clients.js';
import contactRoutes from './contacts.js';
import teamRoutes from './team.js';
import leadRoutes from './leads.js';
import engagementRoutes from './engagements.js';
import taskRoutes from './tasks.js';
import deadlineRoutes from './deadlines.js';
import invoiceRoutes from './invoices.js';
import feesRoutes from './fees.js';
import interactionRoutes from './interactions.js';
import reminderRoutes from './reminders.js';
import documentRoutes from './documents.js';
import settingsRoutes from './settings.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clients', clientRoutes);
router.use('/contacts', contactRoutes);
router.use('/team', teamRoutes);
router.use('/leads', leadRoutes);
router.use('/engagements', engagementRoutes);
router.use('/tasks', taskRoutes);
router.use('/deadlines', deadlineRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/fees', feesRoutes);
router.use('/interactions', interactionRoutes);
router.use('/reminders', reminderRoutes);
router.use('/documents', documentRoutes);
router.use('/settings', settingsRoutes);

export default router;
