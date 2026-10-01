import express from "express";
import * as ReportController from "../controllers/reportController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.use(protect);

router.get("/my-activity", ReportController.getUserReport);
router.get("/department-summary", restrictTo(ROLES.ADMIN, ROLES.MAINTENANCE), ReportController.getDepartmentReport);

export default router;
