import mongoose, { mongo } from "mongoose";



const reviewSchema=new mongoose.Schema({

    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    complaintId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Complaint",
        required:true
    },
    ratings:{
        type:Number,
        // constraints for ratings, minimum 1 and maximum 5
        min:1,
        max:5,
        required:true
    },
    feedback:{
        type:String,
        required:true
    }

},
    {timestamps:true}
);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
