const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },
  duration: { type: Number }, // minutes
  completed: { type: Boolean, default: false },
  score: { type: Number, default: null }, // quiz score after session
  priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
});

const scheduleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    sessions: [sessionSchema],
    totalStudyTime: { type: Number, default: 0 }, // minutes
    completionRate: { type: Number, default: 0 }, // percentage
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
