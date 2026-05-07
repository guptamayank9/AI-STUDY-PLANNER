const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// @PUT /api/user/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, subjects, examDate, studyHoursPerDay, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, subjects, examDate, studyHoursPerDay, preferences },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      user: {
        id:               user._id,
        name:             user.name,
        email:            user.email,
        role:             user.role,
        subjects:         user.subjects,
        examDate:         user.examDate,
        studyHoursPerDay: user.studyHoursPerDay,
        streak:           user.streak,
        totalPoints:      user.totalPoints,
        preferences:      user.preferences,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/user/leaderboard
router.get("/leaderboard", protect, async (req, res) => {
  try {
    const top = await User.find({}, "name totalPoints streak badges")
      .sort({ totalPoints: -1 })
      .limit(10);
    res.json({ success: true, leaderboard: top });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
