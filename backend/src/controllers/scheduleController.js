const axios = require("axios");
const Schedule = require("../models/Schedule");
const QuizResult = require("../models/QuizResult");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// @POST /api/schedule/generate  - calls ML service to generate AI schedule
exports.generateSchedule = async (req, res) => {
  try {
    const user = req.user;

    // Get recent quiz results to find weak subjects
    const quizResults = await QuizResult.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    // Prepare data for ML service
    const payload = {
      user_id: user._id.toString(),
      subjects: user.subjects,
      exam_date: user.examDate,
      study_hours_per_day: user.studyHoursPerDay,
      start_time: user.preferences.studyStartTime,
      end_time: user.preferences.studyEndTime,
      session_duration: user.preferences.sessionDuration,
      break_duration: user.preferences.breakDuration,
      quiz_results: quizResults.map((q) => ({
        subject: q.subject,
        topic: q.topic,
        score: q.score,
        date: q.createdAt,
      })),
    };

    // Call ML service
    const mlResponse = await axios.post(`${ML_URL}/ml/schedule-optimize`, payload);
    const { schedule: mlSchedule } = mlResponse.data;

    // Save to DB
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let saved = await Schedule.findOneAndUpdate(
      { user: user._id, date: today },
      { sessions: mlSchedule, aiGenerated: true },
      { upsert: true, new: true }
    );

    res.json({ success: true, schedule: saved });
  } catch (err) {
    console.error("Schedule generation error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/schedule  - get today's schedule
exports.getSchedule = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedule = await Schedule.findOne({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
    });

    res.json({ success: true, schedule: schedule || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/schedule/week  - get this week's schedules
exports.getWeekSchedule = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const schedules = await Schedule.find({
      user: req.user._id,
      date: { $gte: weekAgo },
    }).sort({ date: 1 });

    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/schedule/:id/session/:sessionId  - mark session complete
exports.completeSession = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id });
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    const session = schedule.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    session.completed = true;
    const completed = schedule.sessions.filter((s) => s.completed).length;
    schedule.completionRate = Math.round((completed / schedule.sessions.length) * 100);

    await schedule.save();

    // Notify via socket
    req.app.get("io").to(req.user._id.toString()).emit("session_completed", {
      sessionId: req.params.sessionId,
      completionRate: schedule.completionRate,
    });

    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
