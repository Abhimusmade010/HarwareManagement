import dotenv from "dotenv";
dotenv.config();

import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { welcomeEmail, welcomeMaintenanceEmail } from "../utils/emailTemplates/welcomeEmail.js";
import { ROLES, normalizeRole } from "../constants/roles.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const registerUser = async (data) => {
    const { Name, Email, Password } = data;
    const normalizedEmail = normalizeEmail(Email);

    const existingUser = await User.findOne({
        Email: normalizedEmail
    });

    if (existingUser) {
        throw new Error("User already exists with same email id");
    }

    const hashPassword = await bcrypt.hash(Password, 10);

    const newUser = new User({
        Name,
        Email: normalizedEmail,
        Password: hashPassword,
        Role: ROLES.USER,
        profileCompleted: false
    });

    await newUser.save();
    await welcomeEmail(newUser);

    const token = jwt.sign(
        {
            userId: newUser._id,
            role: newUser.Role
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );

    return {
        id: newUser._id,
        Name: newUser.Name,
        Email: newUser.Email,
        Role: newUser.Role,
        profileCompleted: newUser.profileCompleted,
        token
    };
};

const logUser = async (data) => {
    const { Email, Password } = data;
    const normalizedEmail = normalizeEmail(Email);

    const user = await User.findOne({ Email: normalizedEmail });
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = jwt.sign(
        {
            userId: user._id,
            role: user.Role
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );

    return {
        message: "Login successful",
        token,
        user: {
            id: user._id,
            Name: user.Name,
            Email: user.Email,
            Role: user.Role,
            profileCompleted: user.profileCompleted,
            mustChangePassword: user.mustChangePassword
        }
    };
};

const getProfile = async (userId) => {
    if (!userId) {
        throw new AppError("User Id is required", 400);
    }
    const user = await User.findById(userId).select("-Password");
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

const changePassword = async (userId, data) => {
    const { currentPassword, newPassword } = data;
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!isMatch) {
        throw new AppError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.Password = hashedPassword;
    user.mustChangePassword = false;

    await user.save();

    return {
        message: "Password changed successfully"
    };
};

const completeProfile = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }   

    user.MobileNo = data.MobileNo || user.MobileNo;
    user.CabinNo = data.CabinNo || user.CabinNo;
    user.Department = data.Department || user.Department;
    user.Designation = data.Designation || user.Designation;
    if (normalizeRole(user.Role) === ROLES.MAINTENANCE) {
        user.Specialization = data.Specialization || user.Specialization;
    }

    user.profileCompleted = true;

    await user.save();  

    return user;
};

export { registerUser, logUser, getProfile, changePassword, completeProfile };
