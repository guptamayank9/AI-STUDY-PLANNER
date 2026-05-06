const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { chat } = require("../controllers/chatController");
router.use(protect);
router.post("/", chat);
module.exports = router;
