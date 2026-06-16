import Complaint from "../models/ComplaintModel.js";

export const getAllComplaints = async () => {
  return await Complaint.find()
    .populate("userId", "Name Email Department")
    .sort({ createdAt: -1 });
};

export const updateComplaintStatus = async (complaintId, status, resolutionDetails) => {
  const updateData = { status, updatedAt: Date.now() };
  
  if (status === 'resolved') {
    updateData.resolutionDate = Date.now();
    updateData.resolutionDetails = resolutionDetails;
  }

  const complaint = await Complaint.findByIdAndUpdate(
    complaintId,
    updateData,
    { new: true, runValidators: true }
  );

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