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

const statusHistorySchema = new mongoose.Schema({
  oldStatus: {
    type: String,
    default: null
  },

  newStatus: {
    type: String,
    required: true
  },

  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  changedAt: {
    type: Date,
    default: Date.now
  },

  remarks: {
    type: String,
    default: ""
  },
  action: {
    type: String,
    default: "status_change"
  }
  
});

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
        "assigned",
        "in-progress",
        "resolved",
        "closed",
        "escalated"
      ],
      default: "assigned"
    },

    escalated: {
      type: Boolean,
      default: false
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

    attachments: [
      {
        type: String
      }
    ],
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
    statusHistory:[statusHistorySchema],
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
