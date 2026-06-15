const express = require("express");
const router = express.Router();

const {
  createChat,
  sendMessage,
  getMoodHistory,
  getMoodStats,
  getChatSessions,
  getChatMessages
} = require("../controllers/chatController");

// CREATE CHAT FIRST
router.post("/create", createChat);

// SEND MESSAGE
const authMiddleware = require("../middleware/authMiddleware");

router.post("/message", authMiddleware, sendMessage);

router.get("/moods/:userId", getMoodHistory);
router.get("/mood-stats/:userId", getMoodStats);

// CHAT SESSIONS
router.get("/sessions/:userId", getChatSessions);
router.get("/messages/:chatId", getChatMessages);

module.exports = router;