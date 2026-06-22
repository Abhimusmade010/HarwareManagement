import sendEmail from "../sendEmail.js";

const complaintStatusUpdatedEmail = async (complaint) => {
  await sendEmail({
    to: complaint.userId.Email,
    subject: `[Complaint #${complaint._id}] Status Updated`,
    html: `
      <h2>Hello ${complaint.userId.Name},</h2>

      <p>Your complaint status has been updated.</p>

      <p>
        <strong>Current Status:</strong> ${complaint.status}
      </p>

      <p>Our team is working on your complaint.</p>

      <p>Thank you for your patience.</p>
    `,
  });
};

export  {complaintStatusUpdatedEmail};