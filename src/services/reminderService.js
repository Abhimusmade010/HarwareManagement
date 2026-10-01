import Complaint from "../models/ComplaintModel.js";
import User from "../models/userModel.js";
import { reminderEmail } from "../utils/emailTemplates/reminderEmail.js";
import escalationEmail from "../utils/emailTemplates/escalationEmail.js";

/**
 * Sends reminder emails to managers for unseen complaints after 48 hours.
 * Auto-escalates complaints to admins if reminder limit (3) is exceeded.
 */
export const sendComplaintReminderToManagerService = async () => {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const reminderCountLimit = 3;

  // Complaints requiring a reminder email
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
    escalated: false,
    lastReminderSentAt: { $lte: fortyEightHoursAgo }
  });

  if (complaintsToEscalate.length > 0) {
    const admins = await User.find({ Role: "admin" }).select("Email");
    const adminEmails = admins.map(admin => admin.Email);

    for (const complaint of complaintsToEscalate) {
      try {
        const oldStatus = complaint.status;
        complaint.status = "escalated";
        complaint.escalated = true;
        complaint.priority = "Critical";

        complaint.statusHistory.push({
          oldStatus: oldStatus,
          newStatus: "escalated",
          changedBy: null,
          remarks: "Auto-escalated due to unresponsiveness"
        });

        await complaint.save();

        for (const email of adminEmails) {
          await escalationEmail(complaint, email).catch(err =>
            console.error("Error sending escalation email:", err)
          );
        }
      } catch (err) {
        console.error(`Error escalating complaint ${complaint._id}:`, err);
      }
    }
  }
};
