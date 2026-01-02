import  express from "express";

import authMiddleware  from "../middleware/protected.js";


import { submitForm } from "../controllers/complaintscontroller.js";

import validate from "../middleware/validations.js";
import { fetchallcomplaints } from "../controllers/complaintscontroller.js";
import { comSchema } from "../validations/complaintvalidatons.js";
const router=express.Router();

router.post("/raisedComplaint",authMiddleware,validate(comSchema),submitForm);

//get all complaint
router.get("/fetchallcomplaints",authMiddleware,fetchallcomplaints)