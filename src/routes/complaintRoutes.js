import express from "express";
import * as ComplaintController from "../controllers/complaintscontroller.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import validate from "../middleware/validations.js";
import { comSchema } from "../validations/complaintvalidatons.js";
import { updateStatus } from "../controllers/complaintscontroller.js";
const   router = express.Router();
import multer from "multer";

// Protect all routes below
router.use(protect);

// USER ROUTES

// this is for storing the uploaded files in memory, and not on disk, you can change it to diskStorage if you want to store them on disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// now middleware of multer is used in the route to handle the file upload, and the uploaded file will be available in req.file
// middleware smust be after validation middleware, so that the file is only uploaded if the validation passes

// but this file uploaod is not mandatory for user ,if user does not upload the file, then also the form should be submitted, so we will use multer's single method to handle the file upload, and if the file is not uploaded, then req.file will be undefined, so we can handle that in the controller
router.post("/raised-complaint",upload.single("image"),validate(comSchema), ComplaintController.submitForm);

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




export default router;
