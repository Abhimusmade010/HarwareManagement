import Complaint from "../models/complaintModel.js";


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

export { getDashboardStatisticss ,getDepartmentStatistics,getCategoryStatistics,searchService};

