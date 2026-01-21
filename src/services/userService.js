// import { id } from "zod/v4/locales";
import Complaint from "../models/ComplaintModel.js"

const submitComplaints=async (data,userId)=>{
    if(!userId){
        throw new Error("User Is is required!");
    }

    const {assetId,description,category,priority}=data; 
    console.log("USer is inside submit form is:",userId);
    
    //handle same assetID case if assetID is samw dont take this as new complaint direct the user to the same assitID existing complaint to add the new complaint to it
    
    // const ispresentAssetID=Complaint.find({assetId});
    // if(ispresentAssetID){
        // direct to the same assetID complaint to add the new compalint to the same complaint

    // }
    const newComplaint=new Complaint({
        assetId:Number(assetId),
        userId:userId,
        // title:title,
        description:description,
        category:category,
        priority:priority || "Medium",

    })

    await newComplaint.save();

    return{
        id:newComplaint._id,
        userId:newComplaint.userId,
        assetId:newComplaint.assetId,
        // title:newComplaint.title,
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

const fetchone=async (complaintId,userId)=>{
    
    //if(!user){
    // }
    const complaint=await Complaint.findOne({_id:complaintId,userId:userId});
    if(!complaint){
        throw new Error("Complaint not found or unauthorized access");
    }
    console.log(complaint);
    return complaint;
}

// const complaintdelete=async(userId,complaintId)=>{

//     if(!userId){
//         throw new Error("User is required!!")
//     }

//     const deletedComplaint = await Complaint.findOneAndDelete({
//       _id: complaintId,
//       userId: userId, // 🔐 ownership check
//     });
//     const allcomplaints=await Complaint.find({userId}).populate("userId");

//     if (!deletedComplaint) {
//       throw new Error("Complaint not deleted");
//     }
//     return allcomplaints;

    
// }

const addNoteToComplaint=async(userId,complaintId,role,message)=>{
    console.log("Entreed in the service of add note")
    const complaint = await Complaint.findOne({
        _id: complaintId,
        userId: userId, // ownership check for users
    });
    console.log("complaint in the service of addnote",complaint)
    if (!complaint) {
        throw new Error("Complaint not found or unauthorized");
    }

    complaint.notes.push({
        message:message,
        addedBy: role,
        addedById: userId,
    });
    console.log("leaveing the add note service layer")
    await complaint.save();
    return complaint;
    
}



//prevent delete after comaplaint is resolved because it will be required for admin data ,resolved complaints must not be deleted from db
export  {submitComplaints,fetchAllComplaints,fetchone,addNoteToComplaint};
