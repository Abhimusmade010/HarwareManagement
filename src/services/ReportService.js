// import Complaint from "../models/ComplaintModel.js";
// import mongoose from "mongoose";

// export const generateDepartmentReport = async () => {
//     const report = await Complaint.aggregate([
//         {
//             $group: {
//                 _id: "$category",
//                 totalComplaints: { $sum: 1 },
//                 resolvedCount: {
//                     $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
//                 },
//                 avgResolutionTime: {
//                     $avg: {
//                         $cond: [
//                             { $and: [{ $eq: ["$status", "resolved"] }, { $gt: ["$resolutionDate", null] }] },
//                             { $subtract: ["$resolutionDate", "$createdAt"] },
//                             null
//                         ]
//                     }
//                 }
//             }
//         },
//         {
//             $project: {
//                 category: "$_id",
//                 totalComplaints: 1,
//                 resolvedCount: 1,
//                 resolutionRate: {
//                     $multiply: [{ $divide: ["$resolvedCount", "$totalComplaints"] }, 100]
//                 },
//                 avgResolutionTimeHours: { $divide: ["$avgResolutionTime", 3600000] } // Convert ms to hours
//             }
//         },
//         { $sort: { totalComplaints: -1 } }
//     ]);

//     return report;
// };

// export const getUserActivityReport = async (userId) => {
//     return await Complaint.find({ userId })
//         .select("status priority category createdAt resolutionDate")
//         .sort({ createdAt: -1 });
// };
