import Complaint from "../models/ComplaintModel.js";
import AppError from "../utils/AppError.js";
import { complaintResolvedEmail } from "../utils/emailTemplates/statusResolved.js";
import { complaintInProgressEmail } from "../utils/emailTemplates/statusProgressed.js";
import { complaintStatusUpdatedEmail } from "../utils/emailTemplates/complaintStatusUpdates.js";



export const updateComplaintStatus = async (complaintId,status,resolutionDetails,userId,role) => {

  
      const complaint = await Complaint.findById(complaintId).populate("userId", "Name Email");

      if (!complaint) {
        return null;
      }
      
      const oldStatus = complaint.status;
      const newStatus = status;
      

      // Only assigned manager can update 
      //admin can update any complaint, but maintainance can only update the complaints assigned to them
      
      
      if (role !== "admin" && complaint.assignedTo.toString() !== userId.toString()) {
        throw new AppError(
          "Not authorized to update this complaint",
          403
        );
      }

      //check for valid status transition
      if (complaint.status === newStatus) {
        throw new AppError(
          `Complaint is already ${newStatus}`,
          400
        );
      }

      complaint.status = newStatus;

      complaint.updatedAt = Date.now();


      if (newStatus === "resolved" &&!resolutionDetails) {
        throw new AppError(
          "Resolution details are required"
        );
      }

      if (newStatus === "resolved") {
        complaint.resolutionDate = Date.now();
        complaint.resolutionDetails = resolutionDetails;

        //add to resolvedby field
         complaint.resolvedBy = userId;
      }
      
      if (newStatus === "escalated") {
        complaint.escalated = true;
        complaint.priority = 'Critical';
      }

      complaint.statusHistory.push({
        oldStatus,
        newStatus: newStatus,
        changedBy: userId,
        remarks: resolutionDetails || ""
      });

      await complaint.save();
      
      //=======send email to the user about the status update===========
      try{
        if(oldStatus !== newStatus){
              if (complaint.status === "resolved"){
                complaintResolvedEmail(complaint).catch(err => {
                  console.error("Error sending email to user:", err.message)  ;
                });
              }
              else if (complaint.status === "in-progress") {
                complaintInProgressEmail(complaint).catch(err => {
                  console.error("Error sending email to user:", err.message)  ;
                });
              } 
              else{
                complaintStatusUpdatedEmail(complaint).catch(err => {
                  console.error("Error sending email to user:", err.message)  ;
                });
              }     
        }
       
      } 

      catch(err){
        console.error("Email sending failed:", err.message);
      }

      // try catch  block to handle email sending failure, but the status update should not be rolled back in case of email failure

      return complaint;

};


export const escalateComplaint = async (complaintId) => {

    const complaint = await Complaint.findById(complaintId);
    const userId= complaint.assignedTo;
    
    const user = await User.findById(userId);
    const maintenanceEmail = user.Email; // Assuming the User model has an Email field

    if (!complaint) {
      return null;
    }
    complaint.status = 'escalated';
    complaint.escalated = true;
    complaint.priority = 'Critical';
    complaint.updatedAt = Date.now(); 

    complaint.statusHistory.push({
      oldStatus: complaint.status,
      newStatus: 'escalated',
      changedBy: maintenanceEmail, // You can set this to the user ID of the person escalating the complaint if available
      remarks: 'Complaint escalated due to critical issue'
    });

    await complaint.save();
    return complaint;
    // return await Complaint.findByIdAndUpdate(
    //     complaintId,
    //     { 
    //         status: 'escalated', 
    //         escalated: true,
    //         priority: 'Critical',
    //         updatedAt: Date.now() 
    //     },
    //     { new: true }
    // );
};