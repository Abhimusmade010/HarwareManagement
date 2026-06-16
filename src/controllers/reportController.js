import * as ReportService from "../services/ReportService.js";
import catchAsync from "../utils/catchAsync.js";

export const getDepartmentReport = catchAsync(async (req, res, next) => {
    const report = await ReportService.generateDepartmentReport();
    res.status(200).json({
        status: 'success',
        data: { report }
    });
});

export const getUserReport = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const report = await ReportService.getUserActivityReport(userId);
    res.status(200).json({
        status: 'success',
        data: { report }
    });
});
