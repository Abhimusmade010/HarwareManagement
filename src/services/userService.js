import Complaint from "../models/ComplaintModel.js"
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

export const submitComplaints = async (data, userId) => {
  const { assetId, description, category, priority } = data;

  const newComplaint = await Complaint.create({
    assetId: Number(assetId),
    userId: userId,
    description: description,
    category: category,
    priority: priority || "Medium",
  });

  return newComplaint;
};

export const fetchAllComplaints = async (userId) => {
  const complaints = await Complaint.find({ userId })
    .select("status category priority assetId description createdAt")
    .sort({ createdAt: -1 });

  return complaints;
};

export const fetchone = async (complaintId, userId) => {
  const complaint = await Complaint.findOne({ _id: complaintId, userId: userId });
  return complaint;
};

export const addNoteToComplaint = async (userId, complaintId, role, message) => {
  const complaint = await Complaint.findOne({
    _id: complaintId,
    userId: userId,
  });

  if (!complaint) return null;

  complaint.notes.push({
    message: message,
    addedBy: role,
    addedById: userId,
  });

  await complaint.save();
  return complaint;
};

export const complaintData = async (userId) => {
  const stats = await Complaint.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const response = {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
    escalated: 0
  };

  stats.forEach(item => {
    response.total += item.count;
    const statusKey = item._id === "in-progress" ? "inProgress" : item._id;
    if (response.hasOwnProperty(statusKey)) {
      response[statusKey] = item.count;
    }
  });

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
