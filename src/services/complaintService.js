import Complaint from "../models/ComplaintModel.js"
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
// import complaintCreationTemplate from "../utils/emailTemplates/complaintCreation.js";
import dotenv from "dotenv";
dotenv.config();
// import {reminderEmail} from "../utils/emailTemplates/reminderEmail.js";
// import escalationEmail from "../utils/emailTemplates/escalationEmail.js";
import Review from "../models/review.js";



export const fetchAllComplaints = async (user, page = 1, limit = 10, search = "", status = "all", category = "all") => {
    let filter = {};

    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    }

    if (user.Role === "user") {
        filter.userId = user._id;
    }

    if (status === "escalated") {
        filter["activityLog.action"] = "Escalated";
    } else if (status !== "all") {
        const statusMap = {
            "assigned": "Assigned",
            "in-progress": "In Progress",
            "resolved": "Resolved",
            "closed": "Closed",
            "open": "Open"
        };
        filter.status = statusMap[status.toLowerCase()] || { $regex: `^${status}$`, $options: 'i' };
    }

    if (category !== "all") {
        filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        const searchConditions = [{ description: searchRegex }];
        
        if (!isNaN(search)) {
            searchConditions.push({ assetId: Number(search) });
        }
        
        filter.$or = searchConditions;
    }

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
        .populate("userId", "Name Email Department " )
        .populate("assignedTo", "Name Email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    complaints.forEach(complaint => {
        const escalationLog = complaint.activityLog?.slice().reverse().find(log => log.action === "Escalated");
        if (escalationLog && escalationLog.metadata && escalationLog.metadata.reason) {
            complaint.escalationNote = escalationLog.metadata.reason;
        }
    });

    // if(complaints.length === 0 && page > 1){
    //     return {
    //         complaints: [], 
    //         pagination: {
    //             total: 0,
    //             page,
    //             pages: 0,
    //             limit
    //         }
    //     };
    // }
    // also sending the manager to whom the complaint is assigned to in the response so that the user can see the manager details in the complaint list page
    // for (let complaint of complaints) {
    //     if (complaint.assignedTo) {
            
    //         const manager = await User.findById(complaint.assignedTo).select("Email");
    //         complaint.assignedTo = manager;
    //         // complaint.priority = complaint.priority || "Medium"; // Default to "Medium" if priority is not set
    //     }
    // }


    const total = await Complaint.countDocuments(filter);

    return {
        complaints,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

export const addNoteToComplaint = async (user, complaintId, message) => {
    let filter = { _id: complaintId };
    
    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    } else if (user.Role === "user") {
        filter.userId = user._id;
    }

    const complaint = await Complaint.findOne(filter);

    // if (!complaint) return null;
    if(!complaint){
        AppError.throwError("No complaint found with that ID", 404);
    }

    complaint.notes.push({
        message: message,
        addedBy: user.Role,
        addedById: user._id,
    });

  await complaint.save();
  return complaint;
};

export const complaintData = async (user) => {
  let filter = {};
    

  if (user.Role === "maintainance") {
      filter.assignedTo = user._id;
  } else if (user.Role === "user") {
      filter.userId = user._id;
  }
//   else if (user.Role === "admin") {
//       // admin can see all complaints, so no filter needed
//   }
  
  // if there are  no complaints in the db then the aggregate function will return an empty array and we need to handle that case as well
    if(user.Role=== "admin"){
        // admin can see all complaints, so we will not filter by userId or assignedTo
        filter = {};
        
    }   
  const stats = await Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);  
    // if(stats.length === 0){
    //     return {
    //         total: 0,
    //         pending: 0,
    //         resolved: 0,
    //         inProgress: 0,
    //         escalated: 0,
    //         closed: 0,
    //     };
    // }

 
  const response = {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
    escalated: 0,
    closed: 0,
  };

  stats.forEach(item => {
    response.total += item.count;
    let statusKey = item._id;
    if (statusKey === "In Progress") statusKey = "inProgress";
    else if (statusKey === "Resolved") statusKey = "resolved";
    else if (statusKey === "Closed") statusKey = "closed";
    
    if (response.hasOwnProperty(statusKey)) {
      response[statusKey] = item.count;
    } else {
        response.pending += item.count; // fallback for assigned etc if not explicitly tracked
    }
  });
  
  // Re-calculate pending as not resolved/closed
  response.pending = response.total - response.resolved - response.closed;
//   if(response.pending < 0) response.pending = 0; // just in case of any mismatch

  return response;
};

export const topCategories = async (userId) => {
  const stats = await Complaint.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return stats;
};


export const submitReviewService = async (userId, complaintId, data) => {
    // Check if complaint is resolved or closed
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);
    if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
        throw new AppError('Can only review resolved or closed complaints', 400);
    }

    const managerId = complaint.resolvedBy || complaint.assignedTo;
    if (!managerId) {
        throw new AppError('No manager assigned to this complaint to review', 400);
    }

    const review = await Review.create({
        userID: userId,
        managerId: managerId,
        ratings: data.ratings,
        feedback: data.feedback
    });
    
    // Update manager's stats
    const manager = await User.findById(managerId);
    if (manager) {
        manager.totalReviews = (manager.totalReviews || 0) + 1;
        const totalRating = ((manager.averageRating || 0) * (manager.totalReviews - 1)) + data.ratings;
        manager.averageRating = totalRating / manager.totalReviews;
        await manager.save();
    }
    
    return review;
};

export const getReviewService = async (complaintId, userId) => {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return null;
    
    const managerId = complaint.resolvedBy || complaint.assignedTo;
    if (!managerId) return null;

    const review = await Review.findOne({ managerId, userID: userId })
        .sort({ createdAt: -1 })
        .populate('userID', 'Name Email');
        
    return review;
};




// Reminder system
// Once assigned, if the manager doesn't open the complaint
// within 48 hours, reminder emails are sent.
// Maximum 3 reminders are sent.

// export const sendComplaintReminderToManagerService = async () => {
    

//     // check for complaints that are assigned to a manager and have not been seen by the manager for more than 48 hours, and send a reminder email to the manager
//     const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

//     // and want to send maximum to three reminders to the manager for the same complaint, so we will check the reminderCount field in the complaint model and if it is less than 3 then we will send the reminder email to the manager and increment the reminderCount field by 1, otherwise we will not send the reminder email to the manager
//     const reminderCountLimit = 3;
    
//     const complaintsToRemind = await Complaint.find({
//         assignedTo: { $ne: null },
//         seenByManager: false,
//         reminderCount: { $lt: reminderCountLimit },
//         createdAt: { $lte: fortyEightHoursAgo },

//         $or: [
//             { lastReminderSentAt: null },
//             {
//                 lastReminderSentAt: {
//                     $lte: fortyEightHoursAgo
//                 }
//             }
//         ]
//     }).populate("assignedTo", "Name Email");


//     for (const complaint of complaintsToRemind) {
//         try {
//             await reminderEmail(complaint, complaint.assignedTo);

//             complaint.reminderCount += 1;
//             // update the lastReminderSentAt field to the current date and time
//             complaint.lastReminderSentAt = new Date();

//             await complaint.save();

//         } catch (error) {
//             console.error(
//                 `Error sending reminder for complaint ${complaint._id}:`,
//                 error
//             );
//         }
//     }

//     // Complaints to escalate (reminderCount >= 3 and 48 hours passed since last reminder)
//     const complaintsToEscalate = await Complaint.find({
//         assignedTo: { $ne: null },
//         seenByManager: false,
//         reminderCount: { $gte: reminderCountLimit },
//         escalated: false, // Ensure we don't repeatedly escalate
//         lastReminderSentAt: { $lte: fortyEightHoursAgo }
//     });

//     if (complaintsToEscalate.length > 0) {
//         const admins = await User.find({ Role: 'admin' }).select("Email");
//         const adminEmails = admins.map(admin => admin.Email);

//         for (const complaint of complaintsToEscalate) {
//             try {
//                 const oldStatus = complaint.status;
//                 complaint.status = 'escalated';
//                 complaint.escalated = true;
//                 complaint.priority = 'Critical';
                
//                 complaint.statusHistory.push({
//                     oldStatus: oldStatus,
//                     newStatus: 'escalated',
//                     changedBy: null, // System escalated
//                     remarks: 'Auto-escalated due to unresponsiveness'
//                 });

//                 await complaint.save();
                
//                 // Notify Admins
//                 for (const email of adminEmails) {
//                     await escalationEmail(complaint, email).catch(err => console.error("Error sending escalation email:", err));
//                 }
//             } catch(err) {
//                 console.error(`Error escalating complaint ${complaint._id}:`, err);
//             }
//         }
//     }
// }