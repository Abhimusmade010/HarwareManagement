// import { id } from "zod/v4/locales";
import Complaint from "../models/ComplaintModel.js"

   
const submitComplaints=async (data,userId)=>{

    if(!userId){
        throw new Error("User Is is required!");
    }

    const {title,description,category,priority}=data; 
    
    
    const newComplaint=new Complaint({
        userId:userId,
        title:title,
        description:description,
        category:category,
        priority:priority || "Medium",
    })

    await newComplaint.save();

    return{
        id:newComplaint._id,
        userId:newComplaint.userId,
        title:newComplaint.title,
        description:newComplaint.description,
        category:newComplaint.category,
        priority:newComplaint.priority
    }

}


const fetchAllComplaints=async (userId)=>{
    
    if(!userId){
        throw new Error("User is required!");
    }
    const comaplaints=await Complaint.find({userId}).populate("userId");
    if(!comaplaints){
        throw new Error("comaplaints not found!!")
    }
    console.log(comaplaints);
    return comaplaints;
    
}

const fetchone=async (complaintId)=>{
    
    //if(!user){
    // }
    const complaint=await Complaint.findOne({_id:complaintId});
    if(!complaint){
        throw new Error("Complaint not found or unauthorized access");
    }
    console.log(complaint);
    return complaint;
}
export  {submitComplaints,fetchAllComplaints,fetchone};
