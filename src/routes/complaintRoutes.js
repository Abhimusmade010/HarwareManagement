import express from "express";
import * as ComplaintController from "../controllers/complaintscontroller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validations.js";
import { comSchema } from "../validations/complaintvalidatons.js";
import { ROLES } from "../constants/roles.js";
import multer from "multer";

const router = express.Router();

// Protect all routes below
router.use(protect);

// USER ROUTES
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/raised-complaint", upload.single("media"), validate(comSchema), ComplaintController.submitForm);
router.get("/my-complaints", ComplaintController.fetchAllComplaint);
router.get("/my-stats", ComplaintController.complaintStats);        
router.get("/top-categories", ComplaintController.topComplaintCategories);

// SHARED ROUTES (User & Admin)
router.get("/:id", ComplaintController.fetchoneComplaint);
router.post("/:id/notes", ComplaintController.NoteToComplaint);
router.post("/:id/reviews", ComplaintController.reviewController);
router.get("/:id/reviews", ComplaintController.getReviewController);

// ADMIN/MAINTENANCE ONLY ROUTES
router.use(restrictTo(ROLES.MAINTENANCE));
router.patch("/:complaintId/status", ComplaintController.updateStatus);
router.patch("/:id/escalate", ComplaintController.escalateComplaint);

export default router;
