import sendEmail from "../sendEmail.js";


const passwordChanged = async (user) => {
    const subject = "Password Changed Successfully";
    const message = `Hello ${user.FirstName},\n\nYour password has been changed successfully. If you did not make this change, please contact our support team immediately.\n\nBest regards,\nThe Team`;

    await sendEmail({
        to: user.Email,
        subject: subject,
        text: message,
    });
}

export  {passwordChanged};
