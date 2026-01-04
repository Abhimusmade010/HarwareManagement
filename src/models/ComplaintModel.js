import mongoose, { mongo } from 'mongoose';
import { stringFormat } from 'zod';
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
  title: {
    type: String,
    required: true
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
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
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
