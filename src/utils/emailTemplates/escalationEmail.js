import sendEmail from "../sendEmail.js";

const escalationEmail = async (complaint, adminEmail) => {
    await sendEmail({
    to: adminEmail,   
    subject: `Complaint Escalated: Ticket #${complaint.assetId}`,
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d9534f;">Action Required: Complaint Escalated</h2>
            <p>Hello Admin,</p>
            <p>A complaint has been automatically escalated due to unresponsiveness from the assigned maintenance manager.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0;">
                <p><strong>Ticket ID:</strong> #${complaint.assetId}</p>
                <p><strong>Category:</strong> ${complaint.category}</p>
                <p><strong>Priority:</strong> Critical (Escalated)</p>
                <p><strong>Description:</strong> ${complaint.description}</p>
            </div>
            
            <p>Please review the issue and reassign or take necessary actions from the Admin Dashboard.</p>
            <br>
            <p>Regards,<br>Maintenance System Auto-Escalation Bot</p>
        </div>
    `
});

};

export default escalationEmail;
