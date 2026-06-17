import express from "express";
import * as ComplaintController from "../controllers/complaintscontroller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validations.js";
import { comSchema } from "../validations/complaintvalidatons.js";
import { updateStatus } from "../controllers/complaintscontroller.js";
const router = express.Router();

// Protect all routes below
router.use(protect);

// USER ROUTES
router.post("/raised-complaint", validate(comSchema), ComplaintController.submitForm);

router.get("/my-complaints", ComplaintController.fetchAllComplaint);

router.get("/my-stats", ComplaintController.complaintStats);
router.get("/top-categories", ComplaintController.topComplaintCategories);





// SHARED ROUTES (User & Admin)
router.get("/:id", ComplaintController.fetchoneComplaint);
router.post("/:id/notes", ComplaintController.NoteToComplaint);




// ADMIN/MAINTENANCE ONLY ROUTES
router.use(restrictTo("maintainance"));
router.patch("/:complaintId/status", ComplaintController.updateStatus);

// router.use(restrictTo("admin", "maintainance"));

router.patch("/:id/escalate", ComplaintController.escalateComplaint);



// ==================admin update is future scope, currently only maintenance can update the status of the complaint========================
// router.patch("/:complaintId/status", ComplaintController.updateStatus);
// router.patch("/updatestatus/:complaintId",protect,restrictTo("maintainance"),updateStatus);

export default router;
