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
router.get("/me", getMe);

// Profile routes
// this can be used common to all users to change their password 
router.patch("/change-password",protect,validate(changePasswordSchema),changePassword);

// now forget password route 
// when user hit forget password route,first verify with the opt to mail and then allow them to change the password without current password
// router.post("/forgot-password",protect,forgotPassword);




export default router;
