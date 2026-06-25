import Complaint from "../models/ComplaintModel.js"
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
import complaintCreationTemplate from "../utils/emailTemplates/complaintCreation.js";
import {S3Client, PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { S3Client,  } from "@aws-sdk/client-s3";

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const submitComplaints = async (data, image,userId) => {

  const { assetId, description, category, priority } = data;

    console.log("Image Data received in submitComplaints:", image);
    // this will contain image buffer,original file name,mimetype,encoding and size of the file
    // you can use this data to store the image in your database or cloud storage like AWS S3
    // for now we will just log the image data to the console
   const manager = await User.findOne({
        Role: "maintainance",
        Specialization: category
    });

    if (!manager) {
        throw new AppError(
            `No ${category} manager available`,
            404
        );
    }

    // now the predesigned url to store on the database so that users can access the image from the database and not from the local storage of the server, so we will use AWS S3 to store the image and get the url of the image and store it in the database
    // const key = `complaints/${Date.now()}-${image.originalname}`;

    // const params={
    //     Bucket: bucketName,
    //     Key:key, // you can change the file name to something unique if you want
    //     Body:image.buffer,
    //     ContentType:image.mimetype
    // }
    // const command=new PutObjectCommand(params);
    // console.log("command", command);
    // await s3.send(command);


    let attachments = [];

    // if aws s3 goes down or image upload fails for some reason, we still want to create the complaint without the image, so we will wrap the image upload in a try catch block and if it fails, we will just log the error and continue with the complaint creation without the image
    try{
         if(image){
            const key = `complaints/${Date.now()}-${image.originalname}`;

            await s3.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: image.buffer,
                ContentType: image.mimetype
            }));

            attachments.push(key);
        }

    }catch(err){
        console.error("Image upload failed:", err.message);
    }
   

    // const imageUrl =`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    // console.log("Image uploaded to S3 with URL:", imageUrl);


    const newComplaint = await Complaint.create({
        assetId: Number(assetId),
        userId: userId,
        description: description,
        category: category,
        assignedTo: manager._id,
        priority: priority || "Medium",
        attachments: attachments, // Store the S3 URL of the uploaded image

        status:"assigned",

        // added the status History in the complaint model to keep track of the status changes and who changed it and when
        statusHistory: [
        {
        oldStatus: null,
        newStatus: "assigned",
        changedBy: null,
        remarks: `Auto assigned to ${manager.Name}`
        }
    ]
    });



    await newComplaint.save();


  

    // ==================send email to the assigned manager with the complaint details=========================
    console.log("Reached before the mail transfer");

    // await is removed from the below function call because we don't want to wait for the email to be sent before returning the response to the user, we will send the email in the background and return the response to the user immediately, so that the user doesn't have to wait for the email to be sent and can continue with their work, this is a good practice to improve the performance of the application and user experience
    complaintCreationTemplate(newComplaint, manager.Email).catch(err => {
        console.error("Error sending email to manager:", err.message);
    }
    );
    // Send email to the assigned manager

    return newComplaint;
};

export const fetchAllComplaints = async (user, page = 1, limit = 10, search = "", status = "all", category = "all") => {
    let filter = {};

    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    }

    if (user.Role === "user") {
        filter.userId = user._id;
    }

    if (status !== "all") {
        filter.status = status;
    }

    if (category !== "all") {
        filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        const searchConditions = [{ description: searchRegex }];
        
        if (!isNaN(search)) {
            searchConditions.push({ assetId: Number(search) });
        }
        
        filter.$or = searchConditions;
    }

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
        .populate("userId", "Name Email Department " )
        .populate("assignedTo", "Name Email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // if(complaints.length === 0 && page > 1){
    //     return {
    //         complaints: [], 
    //         pagination: {
    //             total: 0,
    //             page,
    //             pages: 0,
    //             limit
    //         }
    //     };
    // }
    // also sending the manager to whom the complaint is assigned to in the response so that the user can see the manager details in the complaint list page
    // for (let complaint of complaints) {
    //     if (complaint.assignedTo) {
            
    //         const manager = await User.findById(complaint.assignedTo).select("Email");
    //         complaint.assignedTo = manager;
    //         // complaint.priority = complaint.priority || "Medium"; // Default to "Medium" if priority is not set
    //     }
    // }


    const total = await Complaint.countDocuments(filter);

    return {
        complaints,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        }
    };
};

export const fetchone = async (complaintId, user) => {
    let filter = { _id: complaintId };

    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    } else if (user.Role === "user") {
        filter.userId = user._id;
    }


    const complaint = await Complaint.findOne(filter);

    // const client = new S3Client(clientParams);
    // const getObjectParams = {
    //     Bucket: bucketName,
    //     Key:complaint.attachments[0] 
    // };
    // const command = new GetObjectCommand(getObjectParams);
    // const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    //feteching only one complaint
    
    // complaint.attachments = complaint.attachments.map(attachment => {
    //         return url; // Replace with the signed URL for each attachment
    // });


    
    if (complaint.attachments.length > 0) {
        complaint.attachments = await Promise.all(
            complaint.attachments.map(async (key) => {

                const command = new GetObjectCommand({
                    Bucket: bucketName,
                    Key: key
                });

                return await getSignedUrl(
                    s3,
                    command,
                    { expiresIn: 3600 }
                );
            })
        );
    }

    return complaint;
};

export const addNoteToComplaint = async (user, complaintId, message) => {
    let filter = { _id: complaintId };
    
    if (user.Role === "maintainance") {
        filter.assignedTo = user._id;
    } else if (user.Role === "user") {
        filter.userId = user._id;
    }

    const complaint = await Complaint.findOne(filter);

    // if (!complaint) return null;
    if(!complaint){
        AppError.throwError("No complaint found with that ID", 404);
    }

    complaint.notes.push({
        message: message,
        addedBy: user.Role,
        addedById: user._id,
    });

  await complaint.save();
  return complaint;
};

export const complaintData = async (user) => {
  let filter = {};
    

  if (user.Role === "maintainance") {
      filter.assignedTo = user._id;
  } else if (user.Role === "user") {
      filter.userId = user._id;
  }
//   else if (user.Role === "admin") {
//       // admin can see all complaints, so no filter needed
//   }
  
  // if there are  no complaints in the db then the aggregate function will return an empty array and we need to handle that case as well
    if(user.Role=== "admin"){
        // admin can see all complaints, so we will not filter by userId or assignedTo
        filter = {};
        
    }   
  const stats = await Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);  
    // if(stats.length === 0){
    //     return {
    //         total: 0,
    //         pending: 0,
    //         resolved: 0,
    //         inProgress: 0,
    //         escalated: 0,
    //         closed: 0,
    //     };
    // }

 
  const response = {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
    escalated: 0,
    closed: 0,
  };

  stats.forEach(item => {
    response.total += item.count;
    const statusKey = item._id === "in-progress" ? "inProgress" : item._id;
    if (response.hasOwnProperty(statusKey)) {
      response[statusKey] = item.count;
    } else {
        response.pending += item.count; // fallback for assigned etc if not explicitly tracked
    }
  });
  
  // Re-calculate pending as not resolved/closed
  response.pending = response.total - response.resolved - response.closed;
//   if(response.pending < 0) response.pending = 0; // just in case of any mismatch

  return response;
};

export const topCategories = async (userId) => {
  const stats = await Complaint.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  return stats;
};
