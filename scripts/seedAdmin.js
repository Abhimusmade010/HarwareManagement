import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/userModel.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB connected");

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            Role: "admin"
        });

        if (existingAdmin) {
            console.log("Admin already exists:", existingAdmin.Email);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            10
        );

        const admin = new User({
            Name: "System Admin",
            Email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
            Password: hashedPassword,
            Role: "admin",
            profileCompleted: true
        });

        await admin.save();

        console.log("Admin created successfully");
        console.log("Email:", admin.Email);

        process.exit(0);

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

seedAdmin();