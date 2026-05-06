const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    subjects: [{ type: String }],
    examDate: { type: Date },
    studyHoursPerDay: { type: Number, default: 4 },
    avatar: { type: String, default: "" },
    streak: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    badges: [{ type: String }],
    preferences: {
      studyStartTime: { type: String, default: "09:00" },
      studyEndTime: { type: String, default: "21:00" },
      breakDuration: { type: Number, default: 10 },
      sessionDuration: { type: Number, default: 50 },
      notificationsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
