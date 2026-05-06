const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");
const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// @POST /api/quiz/generate  — AI quiz via ML service (proxy)
router.post("/generate", protect, async (req, res) => {
  try {
    const { subject, topic, difficulty, num_questions } = req.body;
    const response = await axios.post(`${ML_URL}/ml/generate-quiz`, {
      subject, topic, difficulty, num_questions,
    });
    res.json(response.data);
  } catch (err) {
    console.error("Quiz gen error:", err.message);
    res.status(500).json({ success: false, message: "ML service unavailable" });
  }
});
router.get("/:subject", protect, async (req, res) => {
  const bank = {
    Mathematics: [
      { q: "What is the derivative of x²?", options: ["2x", "x", "2", "x²"], answer: "2x" },
      { q: "Integral of 1/x is?", options: ["ln|x|", "x", "1/x²", "log x"], answer: "ln|x|" },
      { q: "Value of sin(90°)?", options: ["0", "1", "-1", "0.5"], answer: "1" },
    ],
    Physics: [
      { q: "SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], answer: "Newton" },
      { q: "Speed of light (m/s)?", options: ["3×10⁸", "3×10⁶", "3×10¹⁰", "3×10⁴"], answer: "3×10⁸" },
    ],
    DSA: [
      { q: "Time complexity of binary search?", options: ["O(log n)", "O(n)", "O(n²)", "O(1)"], answer: "O(log n)" },
      { q: "Which data structure uses LIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: "Stack" },
      { q: "Best case of bubble sort?", options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"], answer: "O(n)" },
    ],
  };
  const subject = req.params.subject;
  const questions = bank[subject] || [];
  res.json({ success: true, questions });
});

// @POST /api/quiz/submit
router.post("/submit", protect, async (req, res) => {
  try {
    const { subject, topic, answers, timeTaken } = req.body;
    const correct = answers.filter((a) => a.isCorrect).length;
    const score = Math.round((correct / answers.length) * 100);

    const result = await QuizResult.create({
      user: req.user._id,
      subject,
      topic,
      score,
      totalQuestions: answers.length,
      correctAnswers: correct,
      timeTaken,
      answers,
    });

    // Award points
    const points = score >= 80 ? 20 : score >= 60 ? 10 : 5;
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPoints: points } });

    res.json({ success: true, result, pointsEarned: points });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
