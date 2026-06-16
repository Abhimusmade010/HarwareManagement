import express from "express";
import { signUpUser, loginUser, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validations.js";
import { signUpSchema, loginSchema } from "../validations/uservalidations.js";
import { changePasswordSchema } from "../validations/uservalidations.js";
import { changePassword } from "../controllers/maintainanceController.js";

const router = express.Router();
import sendEmail from "../utils/sendEmail.js";
import { profileSchema } from "../validations/uservalidations.js";
import { changeProfile } from "../controllers/authController.js";




router.post("/signup", validate(signUpSchema), signUpUser);
router.post("/login", validate(loginSchema), loginUser);
router.use(protect);

router.patch("/complete-profile", validate(profileSchema), changeProfile);

// Profile routes
router.patch("/change-password",protect,validate(changePasswordSchema),changePassword);


router.get("/me", getMe);


export default router;
