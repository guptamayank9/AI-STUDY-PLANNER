const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// @POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, subjects, examDate, studyHoursPerDay } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, subjects, examDate, studyHoursPerDay });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects,          // ← ADDED
        examDate: user.examDate,          // ← ADDED
        studyHoursPerDay: user.studyHoursPerDay, // ← ADDED
        streak: user.streak,
        totalPoints: user.totalPoints,
        preferences: user.preferences,   // ← ADDED
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects,          // ← ADDED
        examDate: user.examDate,          // ← ADDED
        studyHoursPerDay: user.studyHoursPerDay, // ← ADDED
        streak: user.streak,
        totalPoints: user.totalPoints,
        preferences: user.preferences,   // ← ADDED
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};