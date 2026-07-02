import Complaint from "../models/ComplaintModel.js"
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import User from "../models/userModel.js";
import complaintCreationTemplate from "../utils/emailTemplates/complaintCreation.js";
import {S3Client, PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {reminderEmail} from "../utils/emailTemplates/reminderEmail.js";
import escalationEmail from "../utils/emailTemplates/escalationEmail.js";

// import { S3Client,  } from "@aws-sdk/client-s3";

const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const submitComplaints = async (data, media,userId) => {

  const { assetId, description, category, priority } = data;

    console.log("Media Data received in submitComplaints:", media);
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


    // let attachments = [];
    let attachment = null;

    // if aws s3 goes down or image upload fails for some reason, we still want to create the complaint without the image, so we will wrap the image upload in a try catch block and if it fails, we will just log the error and continue with the complaint creation without the image
    try{
         if(media){
            const key = `complaints/${Date.now()}-${media.originalname}`;

            await s3.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: media.buffer,
                ContentType: media.mimetype
            }));
            const type=media.mimetype.startsWith("video/")?"video":"image";


            // attachments.push(key);
            
            attachment={
                key,
                type: type,
                mimeType: media.mimetype,
                originalName: media.originalname,
                size: media.size
            }
            // const complaint = newComplaint;
            
        }

    }catch(err){
        console.error("Image upload failed:", err.message);
    }
   
    console.log(attachment);
    // const imageUrl =`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    // console.log("Image uploaded to S3 with URL:", imageUrl);

    

    const newComplaint = await Complaint.create({
        assetId: Number(assetId),
        userId: userId,
        description: description,
        category: category,
        assignedTo: manager._id,
        priority: priority || "Medium",
        attachment: attachment, // Store the S3 URL of the uploaded image

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


    console.log("Fetched complaint:", complaint);
    // if (complaint.attachment.length > 0) {
    //     complaint.attachment = await Promise.all(

    //         complaint.attachment.map(async (key) => {

    //             const command = new GetObjectCommand({
    //                 Bucket: bucketName,
    //                 Key: key
    //             });

    //             return await getSignedUrl(
    //                 s3,
    //                 command,
    //                 { expiresIn: 3600 }
    //             );
    //         })
    //     );
    // }
    // now as this route is run so user must opened this complaint so we will update the seenByManager field to true if the user is a manager and the complaint is assigned to him/her, so that the manager can see which complaints he/she has already seen and which are new
    if (user.Role === "maintainance" && complaint.assignedTo.toString() === user._id.toString()) {
        complaint.seenByManager = true;
        complaint.seenAt = new Date();
        await complaint.save();
    }
    // but if not seen for more than 48 hours then we wull send the remainder to the manager to seee the complaint 

    const complaintData = complaint.toObject();

    if(complaintData.attachment && complaintData.attachment.key){
        const command =new GetObjectCommand({
            Bucket: bucketName,
            Key: complaintData.attachment.key
        });
        console.log("GetObjectCommand: is", command);
        console.log("key is ", complaintData.attachment.key);
        const url = await getSignedUrl(
            s3,
            command,
            { expiresIn: 3600 }
        );
        complaintData.attachment.url = url;
    // Add the signed URL to the attachment object

    }

    return complaintData;
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

// Reminder system
// Once assigned, if the manager doesn't open the complaint
// within 48 hours, reminder emails are sent.
// Maximum 3 reminders are sent.

export const sendComplaintReminderToManagerService = async () => {
    

    // check for complaints that are assigned to a manager and have not been seen by the manager for more than 48 hours, and send a reminder email to the manager
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // and want to send maximum to three reminders to the manager for the same complaint, so we will check the reminderCount field in the complaint model and if it is less than 3 then we will send the reminder email to the manager and increment the reminderCount field by 1, otherwise we will not send the reminder email to the manager
    const reminderCountLimit = 3;
    
    const complaintsToRemind = await Complaint.find({
        assignedTo: { $ne: null },
        seenByManager: false,
        reminderCount: { $lt: reminderCountLimit },
        createdAt: { $lte: fortyEightHoursAgo },

        $or: [
            { lastReminderSentAt: null },
            {
                lastReminderSentAt: {
                    $lte: fortyEightHoursAgo
                }
            }
        ]
    }).populate("assignedTo", "Name Email");


    for (const complaint of complaintsToRemind) {
        try {
            await reminderEmail(complaint, complaint.assignedTo);

            complaint.reminderCount += 1;
            // update the lastReminderSentAt field to the current date and time
            complaint.lastReminderSentAt = new Date();

            await complaint.save();

        } catch (error) {
            console.error(
                `Error sending reminder for complaint ${complaint._id}:`,
                error
            );
        }
    }

    // Complaints to escalate (reminderCount >= 3 and 48 hours passed since last reminder)
    const complaintsToEscalate = await Complaint.find({
        assignedTo: { $ne: null },
        seenByManager: false,
        reminderCount: { $gte: reminderCountLimit },
        escalated: false, // Ensure we don't repeatedly escalate
        lastReminderSentAt: { $lte: fortyEightHoursAgo }
    });

    if (complaintsToEscalate.length > 0) {
        const admins = await User.find({ Role: 'admin' }).select("Email");
        const adminEmails = admins.map(admin => admin.Email);

        for (const complaint of complaintsToEscalate) {
            try {
                const oldStatus = complaint.status;
                complaint.status = 'escalated';
                complaint.escalated = true;
                complaint.priority = 'Critical';
                
                complaint.statusHistory.push({
                    oldStatus: oldStatus,
                    newStatus: 'escalated',
                    changedBy: null, // System escalated
                    remarks: 'Auto-escalated due to unresponsiveness'
                });

                await complaint.save();
                
                // Notify Admins
                for (const email of adminEmails) {
                    await escalationEmail(complaint, email).catch(err => console.error("Error sending escalation email:", err));
                }
            } catch(err) {
                console.error(`Error escalating complaint ${complaint._id}:`, err);
            }
        }
    }
}
