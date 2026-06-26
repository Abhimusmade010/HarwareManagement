import Complaint from "../models/complaintModel.js";
import ExcelJS from "exceljs";
import AppError from "../utils/AppError.js";
const getDashboardStatisticss = async (user) => {

    let filter = {};

    // STAFF
    if (user.Role === "user") {
        filter = {
        userId: user._id,
        };
    }

    // MAINTENANCE MANAGER
    if (user.Role === "maintainance") {
        filter = {
        assignedTo: user._id,
        };
    }
  
    // ADMIN
    if (user.Role === "admin") {
        filter = {};
    }

    const [totalComplaints,assignedCount,inProgressCount,resolvedCount,escalatedCount,] = await Promise.all([Complaint.countDocuments(filter),

    Complaint.countDocuments({
      ...filter,
      status: "assigned",
    }),

    Complaint.countDocuments({
      ...filter,
      status: "in-progress",
    }),

    Complaint.countDocuments({
      ...filter,
      status: "resolved",
    }),

    Complaint.countDocuments({
      ...filter,
      status: "escalated",
    }),
  ]);

  return {
    totalComplaints,
    assignedCount,
    inProgressCount,
    resolvedCount,
    escalatedCount,
  };
};
 
const getDepartmentStatistics = async (user) => {

  let matchStage = {};

  if (user.Role === "staff") {
    matchStage = {
      userId: user._id,
    };
  }

  if (user.Role === "maintainance") {
    matchStage = {
      assignedTo: user._id,
    };
  }

  const departmentStats = await Complaint.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        count: 1,
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  return departmentStats;
};

const getCategoryStatistics = async (user) => {

  let matchStage = {};

  if (user.Role === "staff") {
    matchStage = {
      raisedBy: user._id,
    };
  }

  if (user.Role === "maintainance") {
    matchStage = {
      assignedTo: user._id,
    };
  }

  const categoryStats = await Complaint.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: "$category",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        count: 1,
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  return categoryStats;
};

const searchService = async (user,queryParams) => {

  let filter = {};

  // Role-based restriction

  if (user.Role === "user") {
    filter.userId = user._id;
  }

  if (user.Role === "maintainance") {
    filter.assignedTo = user._id;
  }

  // Dynamic filters
    if (queryParams.status) {
    filter.status = {
        $regex: `^${queryParams.status}$`,
        $options: "i",
    };
    }

  if (queryParams.department) {
    filter.department = {
      $regex: `^${queryParams.department}$`,
      $options: "i",
    };
  }

    if (queryParams.category) {
        filter.category = {
            $regex: `^${queryParams.category}$`,
            $options: "i",
        };
    }


  // Text Search
  if (queryParams.search) {
    filter.$or = [
      {
        title: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
    ];
  }

  
  const complaints = await Complaint.find(filter)
    .populate("assignedTo", "name")
    .sort("-createdAt");

  return complaints;

};

const downloadSheetService = async (user, queryParams) => {
  let filter = {};

  // based on the user role, we will filter the complaints accordingly

  if (user.Role === "user") {
    filter.userId = user._id;
  }

  if (user.Role === "maintainance") {
    filter.assignedTo = user._id;
  }


  // is user wants to download based on any filter like status, department or category, we will apply those filters as well
  if (queryParams.status) {
    filter.status = {
      $regex: `^${queryParams.status}$`,
      $options: "i",
    };
  }

  if (queryParams.department) {
    filter.department = {
      $regex: `^${queryParams.department}$`,
      $options: "i",
    };
  }

  if (queryParams.category) {
    filter.category = {
      $regex: `^${queryParams.category}$`,
      $options: "i",
    };
  }

  // Text Search
  if (queryParams.search) {
    filter.$or = [
      {
        title: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
    ];
  }

  const complaints = await Complaint.find(filter).sort("-createdAt");


  // create the workBoook using Exceljs library
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Complaints");

  worksheet.columns = [
    { header: "Complaint ID", key: "_id", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "Priority", key: "priority", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Description", key: "description", width: 50 },
  ];

  complaints.forEach((c) => {
    worksheet.addRow({
      _id: c._id.toString(),
      category: c.category,
      priority: c.priority,
      status: c.status,
      description: c.description,
    });
  });

  return workbook;
};


export { getDashboardStatisticss ,getDepartmentStatistics,getCategoryStatistics,searchService,downloadSheetService};

