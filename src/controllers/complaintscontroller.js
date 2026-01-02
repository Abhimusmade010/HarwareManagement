
import { submitComplaints } from "../services/userService.js";


const submitForm=async (req,res)=>{
    try{
        // console.log(req.user);
        const data=req.body;
        const userId=req.user.userId;   //because my backend send this id not client this is must be kept seperate


        const result =await submitComplaints(data,userId);
        console.log("submitform controler try block")
        res.status(201).json({
            result
        });
    }
    
    catch(error){
        console.log("catch block of submit form")
        return res.status(400).json({error:error.message});
    }

} 


const fetchallcomplaints=async (req,res)=>{
    try{

    }
    catch{

    }
}

export {submitForm,fetchallcomplaints}