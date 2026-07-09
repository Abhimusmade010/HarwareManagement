import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


console.log("Email user:", process.env.EMAIL_USER);
console.log("Email pass:", process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    
});

const sendEmail = async ({to,subject,html}) => {
    console.log(`Preparing to send email to ${to} with subject: ${subject}`);
    //sending the email 
    
    //this is sendEmail function i have already written the transported fucntcion above this function
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });

    console.log(`Email sent to ${to} with subject: ${subject}`);
    //this is for the bypassing the email sending in case of testing or development environment, we can comment this out in production
    // console.log(`[EMAIL BYPASSED] Would have sent email to: ${to} with subject: ${subject}`);
    // return Promise.resolve();
};

export default sendEmail;