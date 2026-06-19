import Complaint from "../models/ComplaintModel.js"
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
import complaintCreationTemplate from "../utils/emailTemplates/complaintCreation.js";

export const submitComplaints = async (data, userId) => {
  const { assetId, description, category, priority } = data;

   const manager = await User.findOne({
        Role: "maintainance",
        Specialization: category
    });

    if (!manager) {
        throw new AppError(
            `No ${category} manager available`,
            404
        );
    }


  const newComplaint = await Complaint.create({
    assetId: Number(assetId),
    userId: userId,
    description: description,
    category: category,
    assignedTo: manager._id,
    priority: priority || "Medium",

    status:"assigned",

    // added the status History in the complaint model to keep track of the status changes and who changed it and when
     statusHistory: [
    {
      oldStatus: null,
      newStatus: "assigned",
      changedBy: null,
      remarks: `Auto assigned to ${manager.Name}`
    }
  ]
  });



  await newComplaint.save();


  

  // ==================send email to the assigned manager with the complaint details=========================
  console.log("Reached before the mail transfer");
  await complaintCreationTemplate(newComplaint, manager.Email); // Send email to the assigned manager

  return newComplaint;
};


export const fetchAllComplaints = async (user) => {

    // this route will be common for admin maintenance and user, so we will check the role of the user and return the complaints accordingly
    let filter = {};

    //
    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    }

    if (user.Role === "user") {
        filter.userId = user._id;
    }

    return await Complaint.find(filter)
        .populate(
            "userId",
            "Name Email Department"
        )
        .sort({ createdAt: -1 })
        .lean();
    // return await Complaint.findById(complaintId)
    //       .populate("userId", "Name Email")
    //       .populate("assignedTo", "Name Email")
    //       .populate("statusHistory.changedBy", "Name Email Role");
};

export const fetchone = async (complaintId, user) => {
    let filter = { _id: complaintId };

    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    } else if (user.Role === "user") {
        filter.userId = user._id;
    }

    const complaint = await Complaint.findOne(filter);
    return complaint;
};

export const addNoteToComplaint = async (user, complaintId, message) => {
    let filter = { _id: complaintId };
    
    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    } else if (user.Role === "user") {
        filter.userId = user._id;
    }

    const complaint = await Complaint.findOne(filter);

    if (!complaint) return null;

    complaint.notes.push({
        message: message,
        addedBy: user.Role,
        addedById: user._id,
    });

  await complaint.save();
  return complaint;
};

// export const complaintData = async (userId) => {
//   const stats = await Complaint.aggregate([
//     {
//       $match: { userId: new mongoose.Types.ObjectId(userId) }
//     },
//     {
//       $group: {
//         _id: "$status",
//         count: { $sum: 1 }
//       }
//     }
//   ]);

//   const response = {
//     total: 0,
//     pending: 0,
//     resolved: 0,
//     inProgress: 0,
//     escalated: 0
//   };

//   stats.forEach(item => {
//     response.total += item.count;
//     const statusKey = item._id === "in-progress" ? "inProgress" : item._id;
//     if (response.hasOwnProperty(statusKey)) {
//       response[statusKey] = item.count;
//     }
//   });

//   return response;
// };

export const topCategories = async (userId) => {
  const stats = await Complaint.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return stats;
};
