const express = require("express");
const router = express.Router();

const {
  getMoodInsights,
  getWeeklyInsights,
  getMoodTimeline,
  getTriggerInsights,
  getEmotionalProfile
} = require("../controllers/insightController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/mood", authMiddleware, getMoodInsights);
router.get("/weekly", authMiddleware, getWeeklyInsights);
router.get("/timeline", authMiddleware, getMoodTimeline);
router.get("/triggers", authMiddleware, getTriggerInsights);
router.get("/profile", authMiddleware, getEmotionalProfile);

module.exports = router;


