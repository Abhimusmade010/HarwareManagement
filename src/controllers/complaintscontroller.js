import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import * as ComplaintService from "../services/userService.js";
import * as MaintenanceService from "../services/maintainanceService.js";


export const updateStatus = catchAsync(async (req, res, next) => {
  const { complaintId } = req.params;
  const { status, resolutionDetails } = req.body;
  console.log("req.user:", req.user);
  const complaint =
    await MaintenanceService.updateComplaintStatus(
      complaintId,
      status,
      resolutionDetails,
      req.user._id,
      req.user.Role
    );

  if (!complaint) {
    return next(
      new AppError("No complaint found with that ID", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: { complaint },
  });

});

export const submitForm = catchAsync(async (req, res, next) => {
  console.log("Received complaint submission:", req.body);
  console.log("Received file:", req.file);
  const userId = req.user._id;
  const image = req.file;
  
  const complaint = await ComplaintService.submitComplaints(req.body,image,userId);

  res.status(201).json({
    status: 'success',
    data: { complaint },
  });
});

export const fetchAllComplaint = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const statusFilter = req.query.status || "all";
  const categoryFilter = req.query.category || "all";

  const result = await ComplaintService.fetchAllComplaints(req.user, page, limit, search, statusFilter, categoryFilter);

  res.status(200).json({
    status: 'success',
    results: result.complaints.length,
    pagination: result.pagination,
    data: { complaints: result.complaints },
  });
});

export const fetchoneComplaint = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const complaint = await ComplaintService.fetchone(id, req.user);

  if (!complaint) {
    return next(new AppError('No complaint found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { complaint },
  });
});

export const complaintStats = catchAsync(async (req, res, next) => {
  const stats = await ComplaintService.complaintData(req.user);

  
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
  const complaintId = req.params.id;
  const { message } = req.body;

  const complaint = await ComplaintService.addNoteToComplaint(req.user, complaintId, message);

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


// export const sendCOmplaintReminderToManager
//   = catchAsync(async (req, res, next) => {  

//     await ComplaintService.sendComplaintReminderToManagerService();

//     res.status(200).json({

//       status: "success",
//       message: "Complaint reminders sent to managers successfully",
//     });
//   }); 
