import express from "express";
import * as ReportController from "../controllers/reportController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/my-activity", ReportController.getUserReport);

router.get(
    "/department-summary", 
    restrictTo("admin", "maintainance"), 
    ReportController.getDepartmentReport
);

export default router;
