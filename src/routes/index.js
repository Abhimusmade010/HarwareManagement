import express from "express";
import authRoutes from "./userRoutes.js";                       //Renaming for clarity (Auth and Profile)
import complaintRoutes from "./complaintRoutes.js";
import reportRoutes from "./reportRoutes.js";
import adminRoutes from "./adminRoutes.js";

const router = express.Router();



router.use("/auth", authRoutes);


router.use("/complaints", complaintRoutes);


router.use("/reports", reportRoutes);

router.use("/admin", adminRoutes);


export default router;
