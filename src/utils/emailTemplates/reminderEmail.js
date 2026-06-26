
import sendEmail from "../sendEmail.js";

const reminderEmail = async (complaint, manager) => {
    await sendEmail({
        to: manager.Email,  
        subject: "Complaint Reminder",
        html: `
            <p>Dear ${manager.Name},</p>
            <p>This is a reminder about the complaint submitted by ${complaint.CustomerName}.</p>
            <p>Please review the details and take necessary action.</p>
            <p>Thank you!</p>
        `
    });
};  
export {reminderEmail};
