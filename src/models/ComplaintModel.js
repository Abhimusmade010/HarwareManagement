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
      enum: ["user", "admin","maintenance"],
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


const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assetId: {
      type: Number,
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

    resolutionDate: Date,

    resolutionDetails: String,

    attachments: [
      {
        type: String
      }
    ],

    notes: [noteSchema]
  },
  {
    timestamps: true   // ✅ Correct
  }
);
// complaintSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

const Complaint=mongoose.model('Complaint',complaintSchema);
export default Complaint;
