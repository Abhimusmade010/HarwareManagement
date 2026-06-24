import  express from "express";
import {updateStatus } from "../controllers/complaintscontroller.js";
import validate from "../middleware/validations.js";
import { createMaintenanceSchema } from "../validations/uservalidations.js";
import { createMaintenanceUserController, getMaintenanceEngineersController } from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
const router=express.Router();



// =======make this common to all later on =======
// router.user(protect).restrictTo("admin")


router.post("/create-maintenance",protect,restrictTo("admin"),validate(createMaintenanceSchema),createMaintenanceUserController);

router.get("/engineers", protect, restrictTo("admin"), getMaintenanceEngineersController);


// router.patch("/updatestatus/:complaintId",protect,restrictTo("maintainance"),updateStatus);

// router.get("/complaints",protect,restrictTo("maintainance"),fetchAllComplaintsForMaintenance)


export default router;
