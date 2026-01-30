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
      enum: ["user", "admin"],
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


const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assetId: {  
  type: Number,
  required: true,
  index: true      // this is useful to avoid the asset_complaint
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Hardware", "Network", "Software", "Other"],
    required: true
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved"],
    default: "pending"
  },
  
  attachments:[
    {
      type: String // file URL or path
    }
  ],
  

  createdAt: {
    type: Date,
    default: Date.now
  },
  notes:[noteSchema],

});

const Complaint=mongoose.model('Complaint',complaintSchema);
export default Complaint;
