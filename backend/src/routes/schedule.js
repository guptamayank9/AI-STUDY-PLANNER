const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  generateSchedule,
  getSchedule,
  getWeekSchedule,
  completeSession,
} = require("../controllers/scheduleController");

router.use(protect);
router.get("/", getSchedule);
router.get("/week", getWeekSchedule);
router.post("/generate", generateSchedule);
router.put("/:id/session/:sessionId/complete", completeSession);

module.exports = router;
