import sendEmail from "../sendEmail.js";

//otp generation for forgot password
// const generateOtp = () => {
//             const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
//             return otp;
// };


const sendOtpforForgotPasssword=async(email,otp)=>{
    // const otp = generateOtp();
    
    await sendEmail({
        to:email,
        subject:`Otp for resetting the password`,
        html:`
        //here is the template for the email that will be sent to the user for resetting the password
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d9534f;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Please use the following OTP to reset your password:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0;">
                <p style="font-size: 18px; font-weight: bold;">Your OTP: <span style="color: #d9534f;">${otp}</span></p>
            </div>
            <p>This OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email.</p>
            <br>
            <p>Regards,<br>Maintenance System Support Team</p>
        </div>          
        `
    })
    
}

export { sendOtpforForgotPasssword };