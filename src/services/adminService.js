import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Complaint from "../models/ComplaintModel.js";
import { welcomeMaintenanceEmail } from "../utils/emailTemplates/welcomeEmail.js";
import AppError from "../utils/AppError.js";
import { ROLES } from "../constants/roles.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const createMaintenanceUser = async (data) => {
    const { Name, Email, Specialization } = data;
    console.log("DATA RECEIVED BY SERVICE:", data);
    console.log("SPECIALIZATION:", Specialization);

    const existingUser = await User.findOne({
        Email: Email.toLowerCase()
    });

    if (existingUser) {
        AppError.throwError(
            "A user with this email already exists",
            400
        );
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await User.create({
        Name,
        Email: Email.toLowerCase(),
        Password: hashedPassword,
        Role: ROLES.MAINTENANCE,
        Specialization: Specialization,
        mustChangePassword: true,
        profileCompleted: false
    });

    console.log("temporary passsword:", tempPassword);
    await welcomeMaintenanceEmail(newUser, tempPassword);

    return {
        id: newUser._id,
        Email: newUser.Email,
    };
};

const getMaintenanceEngineersWithStats = async () => {
    const engineers = await User.find({ Role: { $in: [ROLES.MAINTENANCE, "maintainance"] } }).select("-Password");
    
    const engineerStats = await Promise.all(engineers.map(async (eng) => {
        const stats = await Complaint.aggregate([
            { $match: { assignedTo: eng._id } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        let total = 0, pending = 0, resolved = 0, inProgress = 0, escalated = 0;
        stats.forEach(s => {
            total += s.count;
            if (s._id === "resolved" || s._id === "closed") resolved += s.count;
            else if (s._id === "in-progress") inProgress += s.count;
            else if (s._id === "escalated") escalated += s.count;
            else pending += s.count;
        });
        
        return {
            ...eng.toObject(),
            stats: { total, pending, resolved, inProgress, escalated }
        };
    }));
    
    return engineerStats;
};

export { createMaintenanceUser, getMaintenanceEngineersWithStats };
