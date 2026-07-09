    import dotenv from "dotenv";
dotenv.config();

import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { passwordChanged } from "../utils/emailTemplates/passwordChanged.js";
import { welcomeEmail,welcomeMaintenanceEmail } from "../utils/emailTemplates/welcomeEmail.js";
import {sendOtpforForgotPasssword} from "../utils/emailTemplates/forgotPasswordOtp.js";
const normalizeEmail = (email) => email.trim().toLowerCase();

const registerUser = async (data) => {
    //object destructuring to get the fields from data

    const { Name, Email, Password } = data;

    // This is one of those small-looking lines that solve real production problems.
    // normalizing the email ensures that users can't create multiple accounts with the same email but different cases or leading/trailing spaces. This is a common source of bugs in user authentication systems.
    
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
        // throw new Error("Invalid credentials");
        throw new AppError("Invalid credentials", 401);
    }

    // Compare password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
        // throw new Error("Invalid credentials");
        throw new AppError("Invalid credentials", 401);
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
        throw new AppError("User Id is required", 400);
    }
    const user = await User.findById(userId).select("-Password");
    if (!user) {
        throw new AppError("User not found", 404);
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
        throw new AppError("User not found", 404);
    }

    const isMatch =
        await bcrypt.compare(
            currentPassword,
            user.Password
        );

    if (!isMatch) {
        throw new  AppError("Current password is incorrect", 400);
    
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
        // throw new Error("User not found");
        throw new AppError("User not found", 404);
    }   

    // Update the user profile fields
    user.MobileNo = data.MobileNo || user.MobileNo;
    user.CabinNo = data.CabinNo || user.CabinNo;
    user.Department = data.Department || user.Department;
    user.Designation = data.Designation || user.Designation;
    if(user.Role === "maintainance") {
        user.Specialization = data.Specialization || user.Specialization;
    }

    user.profileCompleted = true;

    await user.save();  

    return user;
};


//now the service for forgot password will be here, we will first send the otp to the user email and then verify the otp and then allow them to change the password without current password
const forgotPasswordService=async(email)=>{
    
    const user = await User.findOne({ Email: email });
    console.log("User found in forgotPasswordService:", user);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    user.otp = otp;
    console.log("Generated OTP:", otp); // Log the generated OTP for debugging purposes

    //send the otp to the user email using the email template

    //send the otp to the user email using the email templated
    await sendOtpforForgotPasssword(email, otp);
    console.log("aftet the email is sent "); // Log the success message for debugging purposes


    // // Save the OTP to the user document 
    // //now otp shoulf be saved in the user document and it should be valid for 10 minutes, so we will save the otp and the time when it was generated and then we will check if the otp is valid or not when the user tries to verify it
    user.otpGeneratedAt = Date.now();
    await user.save();

    return {
        message: "OTP sent to email successfully"
    };
}


const changePasswordWithoutCurrentPassword = async (email, newPassword) => {
    const user = await User.findOne({ Email: email });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    await bcrypt.hash(newPassword, 10).then((hashedPassword) => {
        user.Password = hashedPassword;
        user.mustChangePassword = false;
        user.save();
    }
    );
    //now we will send the email to the user that the password has been changed successfully
    // await welcomeEmail(user);
    await passwordChanged(user);

    return {
        message: "Password changed successfully"
    };
}

//return true from here if otp is valid and return false if otp is invalid or expired, we will check the otp and the time when it was generated and then we will check if the otp is valid or not when the user tries to verify it
const otpVerificationService=async(email,otp)=>{
    
    const user = await User.findOne({ Email: email });


    if (!user) {
        throw new AppError("User not found", 404);
    }


    const otpGeneratedAt = user.otpGeneratedAt;
    const now = Date.now();
    const diff = now - otpGeneratedAt;
    if (diff > 10 * 60 * 1000) {
        throw new AppError("OTP has expired", 400);
    }

    //if the otp is invalid or expired then return false
    
    if (user.otp !== otp) {
        throw new AppError("Invalid OTP", 400);
    }

    user.otpVerified = true;
    await user.save();
    
    //check if the otp is expired or not, we will check if the otp was generated more than 10 minutes ago, if yes then we will return false
    

    return;
};

const resetPasswordService = async (email, newPassword) => {
    
    const user =await User.findOne({ Email: email });

    console.log("User found in resetPasswordService:", user);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    if(user.otpVerified !== true) {
        throw new AppError("OTP not verified", 400);
    }
    console.log("OTP verified for user:", user);

    // await bcrypt.hash(newPassword, 10).then((hashedPassword) => {
    //     user.Password = hashedPassword;
        
    // }

    // );

    // const hasedPassword = await bcrypt.hash(newPassword, 10);
    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.Password = hashPassword;
    console.log("Hashed password set for user:", hashPassword);

    console.log("Password reset for user:", user);
    user.otpVerified = false;
    user.otp = null;
    user.otpGeneratedAt = null;

    
    //now we will send the email to the user that the password has been changed successfully
    // await welcomeEmail(user);    
    await passwordChanged(user);

    await user.save();


    return {
        message: "Password changed successfully"
    };
}



export { registerUser, logUser, getProfile, changePassword, completeProfile ,forgotPasswordService,otpVerificationService,resetPasswordService};

