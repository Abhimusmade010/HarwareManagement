import mongoose, { mongo } from 'mongoose';
// import validator from 'validator'


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
  }

});

const Complaint=mongoose.model('Complaint',complaintSchema);
export default Complaint;