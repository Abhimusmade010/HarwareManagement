import Complaint from "../models/ComplaintModel.js";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
import { complaintResolvedEmail } from "../utils/emailTemplates/statusResolved.js";
import { complaintInProgressEmail } from "../utils/emailTemplates/statusProgressed.js";
import { complaintStatusUpdatedEmail } from "../utils/emailTemplates/complaintStatusUpdates.js";

export const updateComplaintStatus = async (complaintId, status, resolutionDetails, userId, role) => {
    const complaint = await Complaint.findById(complaintId).populate("userId", "Name Email");

    if (!complaint) {
        return null;
    }

    const oldStatus = complaint.status;
    const newStatus = status;

    if (role !== "admin" && complaint.assignedTo.toString() !== userId.toString()) {
        throw new AppError("Not authorized to update this complaint", 403);
    }

    if (complaint.status === newStatus) {
        throw new AppError(`Complaint is already ${newStatus}`, 400);
    }

    complaint.status = newStatus;
    complaint.updatedAt = Date.now();

    if (newStatus === "Resolved" && !resolutionDetails) {
        throw new AppError("Resolution details are required");
    }

    if (newStatus === "Resolved") {
        complaint.resolutionDate = Date.now();
        complaint.resolutionDetails = resolutionDetails;
        complaint.resolvedBy = userId;
    }

    complaint.activityLog.push({
        action: "Status Updated",
        description: `Status changed from ${oldStatus} to ${newStatus}`,
        performedBy: userId,
        performedByRole: role,
        timestamp: Date.now(),
        metadata: {
            oldStatus,
            newStatus,
            remarks: resolutionDetails || ""
        }
    });

    await complaint.save();

    try {
        if (oldStatus !== newStatus) {
            if (complaint.status === "Resolved") {
                complaintResolvedEmail(complaint).catch(err => {
                    console.error("Error sending email to user:", err.message);
                });
            } else if (complaint.status === "In Progress") {
                complaintInProgressEmail(complaint).catch(err => {
                    console.error("Error sending email to user:", err.message);
                });
            } else {
                complaintStatusUpdatedEmail(complaint).catch(err => {
                    console.error("Error sending email to user:", err.message);
                });
            }
        }
    } catch (err) {
        console.error("Email sending failed:", err.message);
    }

    return complaint;
};

export const escalateComplaint = async (complaintId, userId, role, escalationNote) => {
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
        return null;
    }

    if (role !== "admin" && complaint.assignedTo.toString() !== userId.toString()) {
        throw new AppError("Not authorized to escalate this complaint", 403);
    }

    if (!escalationNote) {
        throw new AppError("Escalation note is required", 400);
    }

    const admin = await User.findOne({ Role: "admin" });
    if (!admin) {
        throw new AppError("No admin available for escalation", 404);
    }

    complaint.assignedTo = admin._id;
    complaint.priority = 'Critical';
    complaint.status = 'Assigned';
    complaint.updatedAt = Date.now(); 

    complaint.activityLog.push({
        action: "Escalated",
        description: "Complaint escalated to Admin",
        performedBy: userId,
        performedByRole: role,
        timestamp: Date.now(),
        metadata: {
            reason: escalationNote,
            newOwner: admin._id
        }
    });

    
    await complaint.save();
    return complaint;
};

export const transferComplaint = async (complaintId, newCategory, userId, role) => {
    const complaint = await Complaint.findById(complaintId).populate("userId", "Name Email");
    
    if (!complaint) {
        return null;
    }

    if (role !== "admin" && complaint.assignedTo.toString() !== userId.toString()) {
        throw new AppError("Not authorized to transfer this complaint", 403);
    }

    const oldCategory = complaint.category;
    
    if (oldCategory === newCategory) {
        throw new AppError("Complaint is already in this category", 400);
    }

    const newManager = await User.findOne({ Role: "maintainance", Specialization: newCategory });
    if (!newManager) {
        throw new AppError(`No manager available for category ${newCategory}`, 404);
    }

    complaint.category = newCategory;
    complaint.assignedTo = newManager._id;
    complaint.status = 'Assigned';
    complaint.updatedAt = Date.now();

    complaint.activityLog.push({
        action: "Transferred",
        description: `Complaint transferred from ${oldCategory} to ${newCategory}`,
        performedBy: userId,
        performedByRole: role,
        timestamp: Date.now(),
        metadata: {
            oldCategory,
            newCategory,
            newOwner: newManager._id
        }
    });

    await complaint.save();

    try {
        // Here we could send an email using a template
        console.log(`Transferred email should be sent to ${complaint.userId.Email}`);
    } catch(err) {
        console.error("Email sending failed:", err.message);
    }

    return complaint;
};