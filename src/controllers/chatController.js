const Message = require("../models/Message");
const Chat = require("../models/Chat");
const Mood = require("../models/Mood");
const Memory = require("../models/Memory");
const Streak = require("../models/Streak");
const { generateAIResponse } = require("../services/aiService");

const createChat = async (req, res) => {
  try {
    const { userId, title } = req.body; // ✅ TEMP SIMPLE

    const chat = await Chat.create({
      userId,
      title: title || "New Reflection"
    });

    res.json({
      success: true,
      chat
    });

  } catch (err) {
    console.error("❌ CREATE CHAT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


const saveMemory = async (userId, message) => {
  const keywords = [
    "preparing",
    "placement",
    "interview",
    "exam",
    "career",
    "web development",
    "friend",
    "college"
  ];

  const lowerMessage = message.toLowerCase();

  const shouldSave = keywords.some(keyword =>
    lowerMessage.includes(keyword)
  );

  if (shouldSave) {
    await Memory.create({
      userId,
      memory: message
    });
  }
};


// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
const { chatId, message } = req.body;
    

    if (!userId || !chatId || !message) {
      return res.status(400).json({
        error: "userId, chatId, message are required"
      });
    }
    await saveMemory(userId, message);

    // 1. Save USER message
    const userMessage = await Message.create({
      userId,
      chatId,
      role: "user",
      content: message
    });

    // Update chat title if it's the first message and title is "New Reflection"
    const chat = await Chat.findById(chatId);
    if (chat && chat.title === "New Reflection") {
      // Create a short title from the message
      const shortTitle = message.length > 25 ? message.substring(0, 25) + '...' : message;
      chat.title = shortTitle;
      await chat.save();
    }

    // 2. Get AI response
    const aiData = await generateAIResponse(userId, chatId, message);

    // 3. Save AI message
    const aiMessage = await Message.create({
      userId,
      chatId,
      role: "ai",
      content: aiData.text,
      mood: aiData.mood
    });

    // 4. Save mood entry
await Mood.create({
  userId,
  chatId,
  mood: aiData.mood,
  message
});
const today = new Date();
today.setHours(0, 0, 0, 0);

let streak = await Streak.findOne({ userId });

today.setHours(0, 0, 0, 0);

if (!streak) {
  streak = await Streak.create({
    userId,
    currentStreak: 1,
    longestStreak: 1,
    totalJournalDays: 1,
    lastEntryDate: today
  });
} else {
  const lastDate = new Date(streak.lastEntryDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today - lastDate) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    streak.currentStreak += 1;
    streak.totalJournalDays += 1;

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastEntryDate = today;

    await streak.save();
  }

  if (diffDays > 1) {
    streak.currentStreak = 1;
    streak.totalJournalDays += 1;
    streak.lastEntryDate = today;

    await streak.save();
  }
}



await streak.save();

    // 4. Response
    const journalSummary = `User expressed ${aiData.mood} emotion in the message: ${message}`;

return res.json({
  success: true,
  message: "Journal entry created",
  data: {
  reply: aiData.text,
  mood: aiData.mood,
    entryType: "journal",
    journalSummary,
    timestamp: new Date(),
    streak: streak.currentStreak
    
  }
});

  } catch (err) {
    console.error("❌ CHAT ERROR:", err);
    res.status(500).json({
      error: err.message
    });
  }
};

const getMoodHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const moods = await Mood.find({ userId })
      .sort({ createdAt: -1 });

    res.json(moods);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


const getMoodStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const moods = await Mood.find({ userId });

    const stats = {};

    moods.forEach((m) => {
      stats[m.mood] = (stats[m.mood] || 0) + 1;
    });

    res.json(stats);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const getChatSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createChat,
  sendMessage,
  getMoodHistory,
  getMoodStats,
  getChatSessions,
  getChatMessages
};