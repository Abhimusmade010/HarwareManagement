import mongoose from 'mongoose';
import validator from 'validator'


const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required:[ true,'Name is required'],
        trim: true
    },
    Email: {
        type: String,
        required: [true,'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate:[
            {
                validator: (v) => validator.isEmail(v),
                message: 'Please provide a valid email'
            },
            {
                validator: (v) => v.endsWith('@pict.edu'),
                message: 'Only @pict.edu emails are allowed'
            }
        ]
    },
    CabinNo: {
        type: String,
        required: [true,'CabinNo is required'],
        trim: true
    },
    Password: {
        type: String,
        required: [true,'password is required'], 
        minlength: 6,
        // select:false    // this wont sent the password to the user unless  specifically ask 
    },
    Role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user' 
    }


},{timestamps:true})


const User = mongoose.model('User', userSchema);
export default User;