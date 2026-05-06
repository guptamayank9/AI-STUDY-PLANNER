// analytics.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getPerformance, getWeeklyStats } = require("../controllers/analyticsController");
router.use(protect);
router.get("/performance", getPerformance);
router.get("/weekly", getWeeklyStats);
module.exports = router;
