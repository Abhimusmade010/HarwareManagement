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
        throw new Error("User Is is required!");
    }
    const comaplaints=await Complaint.find({userId}).populate("userId", "name department cabinNo email");
    if(!comaplaints){
        throw new Error("comaplaints not found!!")
    }
    console.log(comaplaints);
    return comaplaints;
    
}
export  {submitComplaints,fetchAllComplaints};
