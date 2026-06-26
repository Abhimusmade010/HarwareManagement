import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        trim: true
    },

    Email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    Password: {
        type: String,
        required: true,
        minlength: 6
    },

    Role: {
        type: String,
        enum: ["user", "maintainance", "admin"],
        default: "user"
    },

    profileCompleted: {
        type: Boolean,
        default: false
    },

    mustChangePassword: {
        type: Boolean,
        default: false
    },


    MobileNo: String,

    // User specific
    CabinNo: String,

    Department: String,

    // this is only for maintenance users, so we can use enum to restrict the values
    Specialization: {
        type: String,
        enum: [
            "Hardware",
            "Software"
        ]
    },

    // Admin specific
    Designation: String

}, 
{ timestamps: true }
);



const User = mongoose.model('User', userSchema);
export default User;

