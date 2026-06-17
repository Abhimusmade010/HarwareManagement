import dotenv from "dotenv";
dotenv.config();

import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { welcomeEmail,welcomeMaintenanceEmail } from "../utils/emailTemplates/welcomeEmail.js";
// Normalize email to lowercase and trim spaces
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
        Role:"user",
        profileCompleted: false
    });

    await newUser.save();

    // await sendEmail({
    //     to: newUser.Email,

    //     subject: "Welcome to Complaint Management System",

    //     html: `
    //         <h2>Welcome ${newUser.Name}</h2>

    //         <p>Your account has been created successfully.</p>

    //         <p>You can now login and submit complaints.</p>
    //     `
    // });
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

    // Check if user exists
    const user = await User.findOne({ Email: normalizedEmail });
    // Use generic error message for both not found and wrong password
    if (!user) {
        throw new Error("Invalid credentials");
    }

    // Compare password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // Generate the token
    const token = jwt.sign(
        {
            userId: user._id,
            role: user.Role
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );

    // return {
    //     message: "Login successful",
    //     token,
    //     user: {
    //         id: user._id,
    //         Name: user.Name,
    //         Email: user.Email,
    //         Role: user.Role,
    //         profileCompleted: user.profileCompleted
    //     }
    // };
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

    // ========================Added mustChangePassword to the response for frontend to handle password change flow ========================
};

const getProfile = async (userId) => {
    if (!userId) {
        throw new Error("User Id is required");
    }
    const user = await User.findById(userId).select("-Password");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};


const changePassword = async (userId,data) => {

    const {
        currentPassword,
        newPassword
    } = data;

    const user =
        await User.findById(userId);

    if (!user) {
        throw new Error(
            "User not found"
        );
    }

    const isMatch =
        await bcrypt.compare(
            currentPassword,
            user.Password
        );

    if (!isMatch) {
        throw new Error(
            "Current password is incorrect"
        );
    }

    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            10
        );

    user.Password =
        hashedPassword;

    user.mustChangePassword =
        false;

    await user.save();

    return {
        message:
            "Password changed successfully"
    };
};


const completeProfile = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }   

    // Update the user profile fields
    user.MobileNo = data.MobileNo || user.MobileNo;
    user.CabinNo = data.CabinNo || user.CabinNo;
    user.Department = data.Department || user.Department;
    user.Specialization = data.Specialization || user.Specialization;
    user.Designation = data.Designation || user.Designation;

    user.profileCompleted = true;

    await user.save();  

    return user;
};



export { registerUser, logUser, getProfile, changePassword, completeProfile };

        
