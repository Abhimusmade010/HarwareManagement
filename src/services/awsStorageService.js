// import { S3Client} from "@aws-sdk/client-s3";

import {S3Client, PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import Complaint from "../models/ComplaintModel.js";
import User from "../models/userModel.js"
import AppError from "../utils/AppError.js";
import complaintCreationTemplate from "../utils/emailTemplates/complaintCreation.js";
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
        // assetId: Number(assetId),
        assetId:assetId,
        userId: userId,
        description: description,
        category: category,
        assignedTo: manager._id,
        priority: priority || "Medium",
        attachment: attachment, // Store the S3 URL of the uploaded image

        status: "Assigned",

        activityLog: [
            {
                action: "Created",
                description: `Complaint created and auto-assigned to ${manager.Name}`,
                performedBy: userId,
                performedByRole: "user",
                timestamp: Date.now(),
                metadata: {
                    assignedTo: manager._id
                }
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