const axios = require("axios");
const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// @POST /api/chat
exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    const response = await axios.post(`${ML_URL}/ml/chat`, {
      user_id: req.user._id.toString(),
      message,
      history: history || [],
      context: {
        subjects: req.user.subjects,
        exam_date: req.user.examDate,
      },
    });

    res.json({ success: true, reply: response.data.reply });
  } catch (err) {
    res.status(500).json({ success: false, message: "Chatbot unavailable" });
  }
};
