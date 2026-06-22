import sendEmail from "../sendEmail.js";

//status updation emmail template for resolved and in progress status
const complaintInProgressEmail = async (complaint) => {
    await sendEmail({
        to: complaint.userId.Email,
        subject: `Your complaint status has been updated to ${complaint.status}`,
        html: `     

            <h2>Hello ${complaint.userId.Name},</h2>    
            <p>We wanted to inform you that the status of your complaint with ID <strong>${complaint._id}</strong> has been updated to <strong>${complaint.status}</strong>.</p>
            <p>Our team is actively working on your complaint, and we will keep you updated on any further developments.</p>
            <p>Thank you for your patience. If you have any questions or need further assistance, please do not hesitate to contact us.</p>
            <p>Best regards,<br/>Complaint Management Team</p>
        `
    });
};

export  {complaintInProgressEmail}