const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    score: { type: Number, required: true },       // percentage 0-100
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    timeTaken: { type: Number },                   // seconds
    answers: [
      {
        question: String,
        selected: String,
        correct: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
