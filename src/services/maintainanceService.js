import Complaint from "../models/ComplaintModel.js";

import AppError from "../utils/AppError.js";

// export const updateComplaintStatus = async (complaintId, status, resolutionDetails) => {
//   const updateData = { status, updatedAt: Date.now() };
  
//   if (status === 'resolved') {
//     updateData.resolutionDate = Date.now();
//     updateData.resolutionDetails = resolutionDetails;
//   }

//   const complaint = await Complaint.findByIdAndUpdate(
//     complaintId,
//     updateData,
//     { new: true, runValidators: true }
//   );
//   // ================================ADDED CHECK TO ENSURE MAINTENANCE CAN ONLY UPDATE COMPLAINTS ASSIGNED TO THEM===========================
//   if (!complaint) {
//     return null;
//   }

//   const managerId = complaint.assignedTo;
//   if(complaint.assignedTo.toString()!==managerId.toString()) {
//       // throw new AppError("Not authorized",403);
//       return "Not authorized for this comalaint categor";
//   }

//   return complaint;

// };


export const updateComplaintStatus = async (complaintId,status,resolutionDetails,userId) => {

      const complaint = await Complaint.findById(complaintId);

      if (!complaint) {
        return null;
      }

      // Only assigned manager can update 
      //admin can update any complaint, but maintainance can only update the complaints assigned to them

      if (complaint.assignedTo.toString() !== userId.toString()) {
        throw new AppError(
          "Not authorized to update this complaint",
          403
        );
      }

      complaint.status = status;
      complaint.updatedAt = Date.now();

      // =================later add here mail notification to the user when the status is updated===========================

      if (status === "resolved") {
        complaint.resolutionDate = Date.now();
        complaint.resolutionDetails = resolutionDetails;
      }

      await complaint.save();

      return complaint;
};


export const escalateComplaint = async (complaintId) => {
  
    return await Complaint.findByIdAndUpdate(
        complaintId,
        { 
            status: 'escalated', 
            escalated: true,
            priority: 'Critical',
            updatedAt: Date.now() 
        },
        { new: true }
    );
};