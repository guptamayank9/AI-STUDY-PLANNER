require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const connectRedis = require("./config/redis");
const { scheduleReminders } = require("./utils/scheduler");

// Routes
const authRoutes = require("./routes/auth");
const scheduleRoutes = require("./routes/schedule");
const quizRoutes = require("./routes/quiz");
const analyticsRoutes = require("./routes/analytics");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/user");

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Make io accessible in routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "OK", service: "backend" }));

// Socket.io events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await connectRedis();
  scheduleReminders(io);
  server.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

startServer();
