import express from "express";
import {getDashboardStats,getDepartmentStats,getCategoryStats,searchComplaints} from "../controllers/dashboardController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();


router.use(protect);

router.get("/search",searchComplaints);

router.get("/stats", getDashboardStats);

router.get("/department-stats",getDepartmentStats);

router.use(restrictTo("admin"));

//get categogy wise stats for admin

router.get("/category-stats",getCategoryStats);

export default router;