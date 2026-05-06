const cron = require("node-cron");
const Schedule = require("../models/Schedule");

const scheduleReminders = (io) => {
  // Every 30 minutes - check upcoming sessions and notify
  cron.schedule("*/30 * * * *", async () => {
    try {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const schedules = await Schedule.find({
        date: { $gte: today, $lt: tomorrow },
      }).populate("user", "_id name preferences");

      schedules.forEach((schedule) => {
        if (!schedule.user?.preferences?.notificationsEnabled) return;

        schedule.sessions.forEach((session) => {
          if (session.completed) return;
          const [h, m] = session.startTime.split(":").map(Number);
          const sessionTime = new Date();
          sessionTime.setHours(h, m, 0, 0);
          const diff = (sessionTime - now) / 60000; // minutes

          if (diff > 0 && diff <= 15) {
            io.to(schedule.user._id.toString()).emit("session_reminder", {
              message: `📚 ${session.subject} - ${session.topic} starts in ${Math.round(diff)} minutes!`,
              session,
            });
          }
        });
      });
    } catch (err) {
      console.error("Reminder scheduler error:", err.message);
    }
  });

  console.log("⏰ Reminder scheduler started");
};

module.exports = { scheduleReminders };
