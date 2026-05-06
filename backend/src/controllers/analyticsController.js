const QuizResult = require("../models/QuizResult");
const Schedule = require("../models/Schedule");
const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// @GET /api/analytics/performance
exports.getPerformance = async (req, res) => {
  try {
    const userId = req.user._id;

    const results = await QuizResult.find({ user: userId }).sort({ createdAt: -1 }).limit(100);

    // Group by subject
    const subjectStats = {};
    results.forEach((r) => {
      if (!subjectStats[r.subject]) {
        subjectStats[r.subject] = { scores: [], totalAttempts: 0 };
      }
      subjectStats[r.subject].scores.push(r.score);
      subjectStats[r.subject].totalAttempts += 1;
    });

    const performance = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      totalAttempts: data.totalAttempts,
      trend: data.scores.slice(-3),
      status:
        data.scores[data.scores.length - 1] < 50
          ? "weak"
          : data.scores[data.scores.length - 1] < 75
          ? "average"
          : "strong",
    }));

    // Get ML prediction
    let prediction = null;
    try {
      const mlRes = await axios.post(`${ML_URL}/ml/predict-performance`, {
        user_id: userId.toString(),
        quiz_results: results.map((r) => ({
          subject: r.subject,
          score: r.score,
          date: r.createdAt,
        })),
      });
      prediction = mlRes.data.prediction;
    } catch (e) {
      console.warn("ML prediction unavailable");
    }

    res.json({ success: true, performance, prediction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/analytics/weekly
exports.getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const schedules = await Schedule.find({ user: userId, date: { $gte: weekAgo } });

    const weeklyData = schedules.map((s) => ({
      date: s.date,
      completionRate: s.completionRate,
      totalStudyTime: s.totalStudyTime,
      sessionsCompleted: s.sessions.filter((sess) => sess.completed).length,
      totalSessions: s.sessions.length,
    }));

    // Streak
    const user = req.user;

    res.json({ success: true, weeklyData, streak: user.streak, totalPoints: user.totalPoints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
