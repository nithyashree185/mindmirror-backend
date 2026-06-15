const Streak = require("../models/Streak");

const getStreak = async (req, res) => {
  try {
    const { userId } = req.params;

    const streak = await Streak.findOne({ userId });

    if (!streak) {
      return res.json({
        success: true,
        currentStreak: 0,
        longestStreak: 0,
        totalJournalDays: 0,
        badge: "No streak yet"
      });
    }

    let badge = "";

    if (streak.currentStreak >= 30)
      badge = "30-Day Reflection Master";
    else if (streak.currentStreak >= 14)
      badge = "14-Day Reflection Warrior";
    else if (streak.currentStreak >= 7)
      badge = "7-Day Reflection Streak";
    else if (streak.currentStreak >= 3)
      badge = "3-Day Consistency Badge";
    else
      badge = "Getting Started";

    return res.json({
      success: true,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalJournalDays: streak.totalJournalDays,
      badge
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getStreak
};