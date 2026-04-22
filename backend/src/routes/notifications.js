import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { enforceTenant } from "../middleware/tenant.js";
import { getNotifications } from "../controllers/notificationsController.js";

const router = Router();

router.use(protect);
router.use(enforceTenant);

router.get("/", getNotifications);

export default router;
