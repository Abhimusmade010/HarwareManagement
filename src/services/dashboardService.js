import Complaint from "../models/ComplaintModel.js";
import ExcelJS from "exceljs";
import AppError from "../utils/AppError.js";
import { ROLES, normalizeRole } from "../constants/roles.js";

const getDashboardStatisticss = async (user) => {
    let filter = {};
    const userRole = normalizeRole(user.Role);

    // STAFF / USER
    if (userRole === ROLES.USER) {
        filter = {
            userId: user._id,
        };
    }

    // MAINTENANCE MANAGER
    if (userRole === ROLES.MAINTENANCE) {
        filter = {
            assignedTo: user._id,
        };
    }

    // ADMIN
    if (userRole === ROLES.ADMIN) {
        filter = {};
    }

    const [totalComplaints, assignedCount, inProgressCount, resolvedCount, escalatedCount] = await Promise.all([
        Complaint.countDocuments(filter),
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
    const userRole = normalizeRole(user.Role);

    if (userRole === ROLES.USER || userRole === "staff") {
        matchStage = {
            userId: user._id,
        };
    }

    if (userRole === ROLES.MAINTENANCE) {
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
    const userRole = normalizeRole(user.Role);

    if (userRole === ROLES.USER || userRole === "staff") {
        matchStage = {
            raisedBy: user._id,
        };
    }

    if (userRole === ROLES.MAINTENANCE) {
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

const searchService = async (user, queryParams) => {
    let filter = {};
    const userRole = normalizeRole(user.Role);

    if (userRole === ROLES.USER) {
        filter.userId = user._id;
    }

    if (userRole === ROLES.MAINTENANCE) {
        filter.assignedTo = user._id;
    }

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
    const userRole = normalizeRole(user.Role);

    if (userRole === ROLES.USER) {
        filter.userId = user._id;
    }

    if (userRole === ROLES.MAINTENANCE) {
        filter.assignedTo = user._id;
    }

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

export { getDashboardStatisticss, getDepartmentStatistics, getCategoryStatistics, searchService, downloadSheetService };
