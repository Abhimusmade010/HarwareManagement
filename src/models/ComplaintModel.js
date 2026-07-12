import mongoose, { mongo } from 'mongoose';
import { number, stringFormat } from 'zod';
// import validator from 'validator'

const noteSchema = new mongoose.Schema({
    message: {
      type: String,
      required: true,
      trim: true,
    },
    addedBy: {
      type: String,
      enum: ["user","maintainance","admin"],
      required: true,
    },
    addedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",                                      // optional but powerful
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }            
);

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  performedByRole: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assetId: {
      type: String,
      required: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ["Hardware", "Software"],
      required: true
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },

    status: {
      type: String,
      enum: [
        "Open",
        "Assigned",
        "In Progress",
        "Resolved",
        "Closed"
      ],
      default: "Open"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    resolutionDate: Date,

    resolutionDetails: String,

    // attachments: [
    //   {
    //     type: String
    //   }
    // ],
    attachment: {
        key: String,
        type: {
            type: String,
            enum: ["image", "video"]
        },
        mimeType: String,
        originalName: String,
        size: Number
    },
    seenByManager:{
      type: Boolean,
      default: false
    },
    lastReminderSentAt: {
      type: Date,
      default: null
    },

    seenAt:{
      type: Date,
    },
    reminderCount: {
      type: Number,
      default: 0
    },

    notes: [noteSchema],
    activityLog: [activityLogSchema],
  },

  {
    timestamps: true   // ✅ Correct
  }
);

// this is for the dashboard statistics, so we can use this index to improve the performance of queries that filter by userId, assetId, status and assignedTo


complaintSchema.index({ userId: 1 });

complaintSchema.index({ assignedTo: 1 });

complaintSchema.index({ status: 1 });

complaintSchema.index({ category: 1 });


complaintSchema.index({
  assignedTo: 1,
  status: 1
});


// index for reminder job to find complaints that have not been seen by the manager and have not been reminded yet
complaintSchema.index({
    seenByManager: 1,
    reminderCount: 1,
    createdAt: 1
});

complaintSchema.index({
  userId: 1,
  status: 1
});

const Complaint =mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);

export default Complaint;
