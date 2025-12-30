import express from "express";
import userRoutes from "./userRoutes.js";
// import adminRoutes from "./adminRoutes.js";

const router = express.Router();

console.log("user route hit");

router.use("/user",userRoutes);
// router.use(adminRoutes);

export default router;
