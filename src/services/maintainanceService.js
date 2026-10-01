import Complaint from "../models/ComplaintModel.js";
import AppError from "../utils/AppError.js";
import { complaintResolvedEmail } from "../utils/emailTemplates/statusResolved.js";
import { complaintInProgressEmail } from "../utils/emailTemplates/statusProgressed.js";
import { complaintStatusUpdatedEmail } from "../utils/emailTemplates/complaintStatusUpdates.js";
import { ROLES, normalizeRole } from "../constants/roles.js";

export const updateComplaintStatus = async (complaintId, status, resolutionDetails, userId, role) => {
  const complaint = await Complaint.findById(complaintId).populate("userId", "Name Email");

  if (!complaint) {
    return null;
  }
  
  const oldStatus = complaint.status;
  const newStatus = status;

  // Only assigned manager or admin can update 
  if (normalizeRole(role) !== ROLES.ADMIN && complaint.assignedTo.toString() !== userId.toString()) {
    throw new AppError(
      "Not authorized to update this complaint",
      403
    );
  }

  if (oldStatus === newStatus) {
      throw new AppError(`Complaint is already in ${newStatus} status`, 400);
  }
  complaint.status = newStatus;
  complaint.updatedAt = Date.now();

  if (newStatus === "resolved" && !resolutionDetails) {
    throw new AppError(
      "Resolution details are required"
    );
  }

  if (newStatus === "resolved") {
    complaint.resolutionDate = Date.now();
    complaint.resolutionDetails = resolutionDetails;
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
  
  try {
    if (oldStatus !== newStatus) {
      if (complaint.status === "resolved") {
        complaintResolvedEmail(complaint).catch(err => {
          console.error("Error sending email to user:", err.message);
        });
      } else if (complaint.status === "in-progress") {
        complaintInProgressEmail(complaint).catch(err => {
          console.error("Error sending email to user:", err.message);
        });
      } else {
        complaintStatusUpdatedEmail(complaint).catch(err => {
          console.error("Error sending email to user:", err.message);
        });
      }     
    }
  } catch(err) {
    console.error("Email sending failed:", err.message);
  }

  return complaint;
};

export const escalateComplaint = async (complaintId) => {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return null;
    }

    const userId = complaint.assignedTo;
    const user = await User.findById(userId);
    const maintenanceEmail = user ? user.Email : "";

    complaint.status = 'escalated';
    complaint.escalated = true;
    complaint.priority = 'Critical';
    complaint.updatedAt = Date.now(); 

    complaint.statusHistory.push({
      oldStatus: complaint.status,
      newStatus: 'escalated',
      changedBy: maintenanceEmail,
      remarks: 'Complaint escalated due to critical issue'
    });

    await complaint.save();
    return complaint;
};
