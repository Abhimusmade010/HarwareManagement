import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
// import { normalizeEmail } from "../utils/normalizeEmail.js";
import { welcomeMaintenanceEmail } from "../utils/emailTemplates/welcomeEmail.js";
const normalizeEmail = (email) => email.trim().toLowerCase();

const createMaintenanceUser = async (data) => {

    const { Name, Email,Specialization } = data;

    const existingUser =
        await User.findOne({
            Email: Email.toLowerCase()
        });

    if (existingUser) {
        throw new Error(
            "User already exists"
        );
    }

    const tempPassword =
        Math.random().toString(36).slice(-8);

    const hashedPassword =
        await bcrypt.hash(tempPassword, 10);

    const newUser =
        await User.create({
            Name,
            Email: Email.toLowerCase(),
            Password: hashedPassword,

            Role: "maintainance",
            Specialization,
            mustChangePassword: true,

            profileCompleted: false
        });
    
        // ==============send the mail to the maintenance user with temp password ========================
    await welcomeMaintenanceEmail(newUser,tempPassword);
    

    return {
        id: newUser._id,
        Email: newUser.Email,
        // ========================Added brevo for sending the mail with temp password ========================
        // tempPassword
    };
};




export {createMaintenanceUser};