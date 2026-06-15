const express = require("express");

const cors = require("cors");
const insightRoutes = require("./routes/insightRoutes");
const authRoutes = require("./routes/authRoutes");
const streakRoutes = require("./routes/streakRoutes");

const dotenv = require("dotenv");

const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");

// Load environment variables FIRST
dotenv.config();

// Create express app FIRST
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/insights", insightRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/streak", streakRoutes);



// Connect to database
connectDB();

// Routes
app.use("/api/chat", chatRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("MindMirror backend running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);


const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20 // 20 requests per minute
});

app.use(limiter);