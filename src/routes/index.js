import express from "express";
import userRoutes from "./userRoutes.js";

const router = express.Router();

router.use("/user",userRoutes)


// router.use("/admin",)

export default router;
