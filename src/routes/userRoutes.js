import  express from "express";

import authMiddleware  from "../middleware/protected.js";
//user auth
import { signUpUser,loginUser ,getMe} from "../controllers/userController.js";

//complaint controllers
import { submitForm } from "../controllers/userController.js";

import { fetchAllComplaint,fetchoneComplaint } from "../controllers/userController.js";
// import fetchoneComplaint from
//valition function using zod schemas
import validate from "../middleware/validations.js";
// import { fetchoneComplaint } from "../controllers/userController.js";


//zod schmemas 
import { signUpSchema,loginSchema } from "../validations/uservalidations.js";
import { comSchema } from "../validations/complaintvalidatons.js";

const router=express.Router();

//user auth routes
router.post("/signup",validate(signUpSchema),signUpUser);
router.post("/login",validate(loginSchema),loginUser)

//user details route
router.get("/getprofile",authMiddleware,getMe);   //here add the middleware to check is user is login or not 

//user raising complaint 
router.post("/raisedComplaint",authMiddleware,validate(comSchema),submitForm);

//get all complaint
router.get("/complaints",authMiddleware,fetchAllComplaint);

//fetch one complaint details later for tracking and updation
console.log("before route of one complaint");
router.get("/complaint/:id",authMiddleware,fetchoneComplaint);

export default router;
