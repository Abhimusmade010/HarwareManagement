import  express from "express";
import { signUpUser,loginUser ,getMe} from "../controllers/userController.js";
import validate from "../middleware/validations.js";

import authMiddleware  from "../middleware/protected.js";
import { signUpSchema,loginSchema } from "../validations/uservalidations.js";

const router=express.Router();


router.post("/signup",validate(signUpSchema),signUpUser);
router.post("/login",validate(loginSchema),loginUser)


router.get("/getprofile",authMiddleware,getMe);   //here add the middleware to check is user is login or not 


// router.get("/user")

export default router;
