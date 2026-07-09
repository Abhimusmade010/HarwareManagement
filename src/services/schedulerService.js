

import Complaint from "../models/complaint.js";
import User from "../models/user.js";
import { reminderEmail } from "../utils/emailTemplates/reminderEmail.js";
import escalationEmail from "../utils/emailTemplates/escalationEmail.js";


export const sendComplaintReminderToManagerService = async () => {
    

    // check for complaints that are assigned to a manager and have not been seen by the manager for more than 48 hours, and send a reminder email to the manager
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // and want to send maximum to three reminders to the manager for the same complaint, so we will check the reminderCount field in the complaint model and if it is less than 3 then we will send the reminder email to the manager and increment the reminderCount field by 1, otherwise we will not send the reminder email to the manager
    const reminderCountLimit = 3;
    
    const complaintsToRemind = await Complaint.find({
        assignedTo: { $ne: null },
        seenByManager: false,
        reminderCount: { $lt: reminderCountLimit },
        createdAt: { $lte: fortyEightHoursAgo },

        $or: [
            { lastReminderSentAt: null },
            {
                lastReminderSentAt: {
                    $lte: fortyEightHoursAgo
                }
            }
        ]
    }).populate("assignedTo", "Name Email");


    for (const complaint of complaintsToRemind) {
        try {
            await reminderEmail(complaint, complaint.assignedTo);

            complaint.reminderCount += 1;
            // update the lastReminderSentAt field to the current date and time
            complaint.lastReminderSentAt = new Date();

            await complaint.save();

        } catch (error) {
            console.error(
                `Error sending reminder for complaint ${complaint._id}:`,
                error
            );
        }
    }

    // Complaints to escalate (reminderCount >= 3 and 48 hours passed since last reminder)
    const complaintsToEscalate = await Complaint.find({
        assignedTo: { $ne: null },
        seenByManager: false,
        reminderCount: { $gte: reminderCountLimit },
        escalated: false, // Ensure we don't repeatedly escalate
        lastReminderSentAt: { $lte: fortyEightHoursAgo }
    });

    if (complaintsToEscalate.length > 0) {
        const admins = await User.find({ Role: 'admin' }).select("Email");
        const adminEmails = admins.map(admin => admin.Email);

        for (const complaint of complaintsToEscalate) {
            try {
                const oldStatus = complaint.status;
                complaint.status = 'escalated';
                complaint.escalated = true;
                complaint.priority = 'Critical';
                
                complaint.statusHistory.push({
                    oldStatus: oldStatus,
                    newStatus: 'escalated',
                    changedBy: null, // System escalated
                    remarks: 'Auto-escalated due to unresponsiveness'
                });

                await complaint.save();
                
                // Notify Admins
                for (const email of adminEmails) {
                    await escalationEmail(complaint, email).catch(err => console.error("Error sending escalation email:", err));
                }
            } catch(err) {
                console.error(`Error escalating complaint ${complaint._id}:`, err);
            }
        }
    }
}
