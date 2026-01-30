import mongoose from "mongoose";

const maintenanceStaffSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    Password: {
      type: String,
      required: true,
      select: false,
    },
    Department: {
      type: String, // IT, Electrical, Civil, Network
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MaintenanceStaff", maintenanceStaffSchema);
