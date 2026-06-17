// import sendEmail from "../emailTemplates/sendEmail.js";
import sendEmail from "../sendEmail.js";

const complaintCreationTemplate = async (complaint, managerEmail) => {
    await sendEmail({
    to: managerEmail,   
    subject: "New Complaint Assigned",

    html: `
        <h3>New Complaint Assigned</h3>
    `
});

};

export default complaintCreationTemplate;
