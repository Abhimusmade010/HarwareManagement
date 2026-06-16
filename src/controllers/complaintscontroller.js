import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import * as ComplaintService from "../services/userService.js";
import * as MaintenanceService from "../services/maintainanceService.js";

export const fetchAllComplaintsForMaintenance = catchAsync(async (req, res, next) => {
  const complaints = await MaintenanceService.getAllComplaints();

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    data: { complaints },
  });
});

export const updateStatus = catchAsync(async (req, res, next) => {
  const { complaintId } = req.params;
  const { status, resolutionDetails } = req.body;

  const complaint = await MaintenanceService.updateComplaintStatus(complaintId, status, resolutionDetails);

  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { complaint },
  });
});

export const submitForm = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const complaint = await ComplaintService.submitComplaints(req.body, userId);

  res.status(201).json({
    status: 'success',
    data: { complaint },
  });
});

export const fetchAllComplaint = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const complaints = await ComplaintService.fetchAllComplaints(userId);

  res.status(200).json({
    status: 'success',
    results: complaints.length,
    data: { complaints },
  });
});

export const fetchoneComplaint = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const complaint = await ComplaintService.fetchone(id, userId);

  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { complaint },
  });
});

export const complaintStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const stats = await ComplaintService.complaintData(userId);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

export const topComplaintCategories = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const stats = await ComplaintService.topCategories(userId);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

export const NoteToComplaint = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const complaintId = req.params.id;
  const { message } = req.body;
  const role = req.user.Role;

  const complaint = await ComplaintService.addNoteToComplaint(userId, complaintId, role, message);

  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: "Complaint Note added successfully!",
    data: { complaint }
  });
});

export const escalateComplaint = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const complaint = await MaintenanceService.escalateComplaint(id);

    if (!complaint) {
        return next(new AppError('No complaint found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Complaint escalated to senior management',
        data: { complaint }
    });
});