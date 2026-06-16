import  express from "express";
import { maintenanceAuth } from "../middleware/maintainanceProtected.js";
import {updateStatus, fetchAllComplaintsForMaintenance } from "../controllers/complaintscontroller.js";
import validate from "../middleware/validations.js";
import { createMaintenanceSchema } from "../validations/uservalidations.js";
import { createMaintenanceUserController } from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
const router=express.Router();



// =======make this common to all later on =======
// router.user(protect).restrictTo("admin")


router.post("/create-maintenance",protect,restrictTo("admin"),validate(createMaintenanceSchema),createMaintenanceUserController);

// router.post("/maintainancelogin",maintenanceLoginController );
//add note to the complaints 
//change the status
//marked as seen once the complaint marked user cannot delete or update the complaint
//assign technician to the complaint->techinicin get mailed

router.patch("/updatestatus/:complaintId",maintenanceAuth,updateStatus);

router.get("/complaints",maintenanceAuth,fetchAllComplaintsForMaintenance)

export default router;
