import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Complaint from "../models/ComplaintModel.js";
 const maintenanceLogin = (data) => {
  const { password } = data;

  if (!password) {
    throw new Error("Password is required");
  }

  if (password !== process.env.MAINTENANCE_PASSWORD) {
    throw new Error("Password not matched!!");
  }

  const token = jwt.sign(
    { access: "maintenance" },
    process.env.MAINTENANCE_SECRET,
    { expiresIn: "12h" }
  );


  console.log("inside admin login service,",token);

   return {
    success: true,
    message: "Maintenance login successful",
    token,
  };
};

const updateComplaintStatus=async (complaintId,status)=>{
    
    // const allowedStatus = ["pending", "in-progress", "resolved"];
    console.log("Inside updateComplaintStatus service layer",status);
    console.log("compalint id is :",complaintId);
    // if (!allowedStatus.includes(status)) {
    //   throw new Error("Status not Found")
    // }
    console.log("before complaint update status")
    const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
      {
        status,
        updatedAt: new Date(),
      },

      { new: true }

    );
    console.log(complaint);
    if(!complaint) {
      return {
        success: false,
        message: "Complaint not found",
      }
    }
    return {
      success: true,
      message: "Complaint status updated successfully",
      data: complaint,
    };

}
export {maintenanceLogin,updateComplaintStatus};