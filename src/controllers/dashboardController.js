import catchAsync from "../utils/catchAsync.js";
// import * as Dashboard from "../services/dashboardService.js";
import { getDashboardStatisticss ,getDepartmentStatistics,getCategoryStatistics,searchService} from "../services/dashboardService.js";



export const getDashboardStats = catchAsync(
  async (req, res, next) => {

    const stats = await getDashboardStatisticss(
      req.user
    );

    res.status(200).json({
      status: "success",
      data: stats,
    });
  }
);

export const getDepartmentStats = catchAsync(
  async (req, res, next) => {

    const stats = await getDepartmentStatistics(
      req.user
    );

    res.status(200).json({
      status: "success",
      data: stats,
    });
  }
);

export const getCategoryStats = catchAsync(
  async (req, res, next) => {

    const stats = await getCategoryStatistics(
      req.user
    );

    res.status(200).json({
      status: "success",
      data: stats,
    });
  }
);

export const searchComplaints = catchAsync(
  async (req, res, next) => {

    const complaints =
      await searchService(
        req.user,
        req.query
      );

    res.status(200).json({
      status: "success",
      results: complaints.length,
      data: complaints,
    });

  }

);


