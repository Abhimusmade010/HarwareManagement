import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({to,subject,html}) => {
    // Bypassing email sending to prevent Render SMTP timeout errors
    console.log(`[EMAIL BYPASSED] Would have sent email to: ${to} with subject: ${subject}`);
    return Promise.resolve();
};

export default sendEmail;