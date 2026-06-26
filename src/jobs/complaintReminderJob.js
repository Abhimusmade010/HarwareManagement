import cron from "node-cron";

import {sendComplaintReminderToManagerService} from "../services/userService.js";

cron.schedule("0 9 * * *", async () => {
  try {
    await sendComplaintReminderToManagerService(); 

    } catch (error) {   

    console.error("Error sending complaint reminders:", error);
  }

});
