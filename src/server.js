const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const rateLimit = require("express-rate-limit");

const insightRoutes = require("./routes/insightRoutes");
const authRoutes = require("./routes/authRoutes");
const streakRoutes = require("./routes/streakRoutes");
const chatRoutes = require("./routes/chatRoutes");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load env
dotenv.config();

// App
const app = express();

// Rate limiter (ONLY ONCE)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20
});

// Middlewares
app.use(cors({
  origin: "https://mindmirror-journal-ai.netlify.app",
  credentials: true
}));

app.use(express.json());
app.use(limiter);

// Routes
app.use("/api/insights", insightRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/chat", chatRoutes);

// DB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("MindMirror backend running 🚀");
});

// Error handler LAST
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});