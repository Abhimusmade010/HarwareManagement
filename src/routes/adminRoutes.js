

import { signUpUser } from "../controllers/userController.js";

import  express from "express";
import authMiddleware from "../middleware/protected.js";
import { getProfile } from "../services/authService.js";

const router=express.Router();

router.post("/signUp",signUpUser);
router.get("/getProfile",authMiddleware,getProfile);

export default router;
