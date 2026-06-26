

import mongoose from "mongoose";


import dotenv from "dotenv";

dotenv.config();
// import connectDB from "./config/db.js";
// connectDB();
const connectDB = async () => {
    try { 
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }   
};

export default connectDB;



