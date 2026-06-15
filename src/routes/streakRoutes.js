const express = require("express");
const router = express.Router();

const { getStreak } = require("../controllers/streakController");

router.get("/:userId", getStreak);

module.exports = router;
