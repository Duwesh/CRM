import { Router } from "express";
import { protect } from '../middleware/auth.js';
import { enforceTenant } from "../middleware/tenant.js";
import * as DashboardController from "../controllers/dashboardController.js";

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get("/summary", DashboardController.getDashboardSummary);

export default router;

