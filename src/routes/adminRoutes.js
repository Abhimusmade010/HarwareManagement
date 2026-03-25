import  express from "express";
import {maintenanceLoginController } from "../controllers/maintainanceController.js"
import { maintenanceAuth } from "../middleware/maintainanceProtected.js";
import { fetchAllComplaintsForMaintenance } from "../controllers/complaintscontroller.js";
import { updateStatus } from "../controllers/complaintscontroller.js";
const router=express.Router();


router.post("/maintainancelogin",maintenanceLoginController );
//add note to the complaints 
//change the status
//marked as seen once the complaint marked user cannot delete or update the complaint
//assign technician to the complaint->techinicin get mailed

router.patch("/updatestatus/:complaintId",maintenanceAuth,updateStatus);

router.get("/complaints",maintenanceAuth,fetchAllComplaintsForMaintenance)

export default router;
