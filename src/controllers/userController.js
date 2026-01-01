import { registerUser,logUser ,getProfile } from "../services/authService.js";
import { submitComplaints } from "../services/userService.js";

const signUpUser= async (req,res)=>{
    
    try{
        const data=req.body;
        const result =await registerUser(data);
        res.status(201).json({message:"User created successfully"});
    }catch(error){
        res.status(400).json({error:error.message});

    }
};

const loginUser=async(req,res)=>{
    try{
        const data=req.body;
        const result=await logUser(data);
        res.status(200).json(result);            //200 status code is for successfully login  used for geenreal success!!!
  
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};

const getMe=async (req,res)=>{
    try{
        const userId=req.user.userId;
        const result=await getProfile(userId);
        // res.status(200).json(result);
        res.status(200).json({
            result
        });
    }
    catch(error){
        return res.status(400).json({error:error.message});
    }
};

const submitForm=async (req,res)=>{
    try{
        // console.log(req.user);
        const data=req.body;
        const userId=req.user.userId;   // because my backend send this id not client this is must be kept seperate

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


export {signUpUser,loginUser,getMe,submitForm};
