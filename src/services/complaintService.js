import Complaint from "../models/ComplaintModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import complaintCreationTemplate from "../utils/emailTemplates/complaintCreation.js";
import { uploadMediaToS3, getPresignedUrlForAttachment } from "./s3Service.js";
import { ROLES, normalizeRole } from "../constants/roles.js";

/**
 * Submits a new complaint, handles file attachments via S3, and notifies the manager.
 */
export const submitComplaints = async (data, media, userId) => {
  const { assetId, description, category, priority } = data;

  const manager = await User.findOne({
    Role: { $in: [ROLES.MAINTENANCE, "maintainance"] },
    Specialization: category
  });

  if (!manager) {
    throw new AppError(`No ${category} manager available`, 404);
  }

  const attachment = await uploadMediaToS3(media, "complaints");

  const newComplaint = await Complaint.create({
    assetId: assetId,
    userId: userId,
    description: description,
    category: category,
    assignedTo: manager._id,
    priority: priority || "Medium",
    attachment: attachment,
    status: "assigned",
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

  complaintCreationTemplate(newComplaint, manager.Email).catch(err => {
    console.error("Error sending email to manager:", err.message);
  });

  return newComplaint;
};

/**
 * Fetches a single complaint by ID according to user role permissions.
 * Generates presigned URL for attachment if present.
 */
export const fetchone = async (complaintId, user) => {
  let filter = { _id: complaintId };
  const userRole = normalizeRole(user.Role);

  if (userRole === ROLES.MAINTENANCE) {
    filter.assignedTo = user._id;
  } else if (userRole === ROLES.USER) {
    filter.userId = user._id;
  }

  const complaint = await Complaint.findOne(filter);

  if (!complaint) {
    throw new AppError("No complaint found with that ID", 404);
  }

  if (
    userRole === ROLES.MAINTENANCE &&
    complaint.assignedTo.toString() === user._id.toString()
  ) {
    complaint.seenByManager = true;
    complaint.seenAt = new Date();
    await complaint.save();
  }

  const complaintData = complaint.toObject();

  if (complaintData.attachment && complaintData.attachment.key) {
    complaintData.attachment.url = await getPresignedUrlForAttachment(
      complaintData.attachment.key
    );
  }

  return complaintData;
};

/**
 * Fetches all complaints with pagination, search, and filtering options.
 */
export const fetchAllComplaints = async (
  user,
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  category = "all"
) => {
  let filter = {};
  const userRole = normalizeRole(user.Role);

  if (userRole === ROLES.MAINTENANCE) {
    filter.assignedTo = user._id;
  }

  if (userRole === ROLES.USER) {
    filter.userId = user._id;
  }

  if (status !== "all") {
    filter.status = status;
  }

  if (category !== "all") {
    filter.category = { $regex: `^${category}$`, $options: "i" };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    const searchConditions = [{ description: searchRegex }];

    if (!isNaN(search)) {
      searchConditions.push({ assetId: Number(search) });
    }

    filter.$or = searchConditions;
  }

  const skip = (page - 1) * limit;

  const complaints = await Complaint.find(filter)
    .populate("userId", "Name Email Department ")
    .populate("assignedTo", "Name Email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

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

/**
 * Adds a note to a complaint.
 */
export const addNoteToComplaint = async (user, complaintId, message) => {
  let filter = { _id: complaintId };
  const userRole = normalizeRole(user.Role);

  if (userRole === ROLES.MAINTENANCE) {
    filter.assignedTo = user._id;
  } else if (userRole === ROLES.USER) {
    filter.userId = user._id;
  }

  const complaint = await Complaint.findOne(filter);

  if (!complaint) {
    AppError.throwError("No complaint found with that ID", 404);
  }

  complaint.notes.push({
    message: message,
    addedBy: userRole,
    addedById: user._id
  });

  await complaint.save();
  return complaint;
};

/**
 * Calculates complaint status statistics for a user, manager, or admin.
 */
export const complaintData = async user => {
  let filter = {};
  const userRole = normalizeRole(user.Role);

  if (userRole === ROLES.MAINTENANCE) {
    filter.assignedTo = user._id;
  } else if (userRole === ROLES.USER) {
    filter.userId = user._id;
  } else if (userRole === ROLES.ADMIN) {
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

  const response = {
    total: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    escalated: 0,
    pending: 0
  };

  stats.forEach(item => {
    response.total += item.count;
    const statusKey = item._id === "in-progress" ? "inProgress" : item._id;
    if (response.hasOwnProperty(statusKey)) {
      response[statusKey] = item.count;
    }
  });

  response.pending = response.assigned + response.inProgress + response.escalated;

  return response;
};

/**
 * Retrieves top complaint categories for a given user.
 */
export const topCategories = async userId => {
  const stats = await Complaint.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return stats;
};
