

import sendEmail from "../sendEmail.js";

const complaintResolvedEmail = async (complaint) => {
  await sendEmail({
    to: complaint.userId.Email,
    subject: `[Complaint #${complaint._id}] Complaint Resolved`,
    html: `
      <h2>Hello ${complaint.userId.Name},</h2>

      <p>Your complaint has been resolved.</p>

      <p>
        <strong>Resolution Details:</strong><br/>
        ${complaint.resolutionDetails}
      </p>

      <p>
        <strong>Resolved On:</strong>
        ${new Date(complaint.resolutionDate).toLocaleString()}
      </p>

      <p>Thank you for using the Complaint Management System.</p>
    `,
  });
};

export  {complaintResolvedEmail};