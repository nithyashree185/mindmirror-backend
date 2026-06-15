const axios = require("axios");
const Mood = require("../models/Mood");
const Message = require("../models/Message");
const { generateAIInsights } = require("../services/insightAIService");

const getMoodInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    const moods = await Mood.find({ userId });

    if (!moods.length) {
      return res.json({
        message: "No mood data found"
      });
    }

    // Count moods
    const moodCount = {};

    moods.forEach(m => {
      moodCount[m.mood] = (moodCount[m.mood] || 0) + 1;
    });

    // Find dominant mood
    let dominantMood = null;
    let maxCount = 0;

    for (let mood in moodCount) {
      if (moodCount[mood] > maxCount) {
        maxCount = moodCount[mood];
        dominantMood = mood;
      }
    }

    // Simple insight logic
    const aiInsights = await generateAIInsights(moodCount, dominantMood);

    res.json({
      moodCount,
      dominantMood,
      summary: aiInsights.summary,
  causes: aiInsights.causes,
  suggestion: aiInsights.suggestion
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

const getWeeklyInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const moods = await Mood.find({
      userId,
      createdAt: { $gte: startDate }
    });

    // COUNT MOODS
const moodCount = {};

moods.forEach(entry => {
  moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
});

// DOMINANT MOOD
let dominantMood = null;
let max = 0;

for (let key in moodCount) {
  if (moodCount[key] > max) {
    max = moodCount[key];
    dominantMood = key;
  }
}

// PERCENTAGES
const total = moods.length;
const percentages = {};

for (let key in moodCount) {
  percentages[key] = Math.round((moodCount[key] / total) * 100);
}

// SUMMARY
let summary = "No data available";

if (dominantMood) {
  summary = `You were mostly ${dominantMood} this week.`;
}

    const aiSummary = await generateWeeklyAISummary(moodCount, dominantMood);

res.json({
  success: true,
  message: "Weekly AI insights generated",
  data: {
    moodCount,
    dominantMood,
    percentages,
    ...aiSummary
  }
});

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getTriggerInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const messages = await Message.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const prompt = `
You are MindMirror AI, a behavioral trigger detection system.

Analyze the user's journal entries and extract emotional triggers.

Return ONLY valid JSON.

Entries:
${messages.map(m => `Text: ${m.content} | Mood: ${m.mood}`).join("\n")}


Rules:
- Identify actual causes behind emotions.
- Map situations → emotions.
- Use the meaning of the sentence, not just keywords.
- Do NOT invent triggers.
- Do NOT assume that friends always mean happiness.
- If friends are mentioned negatively, use lonely or sad.
- If friends are mentioned positively, use happy.
- If no clear trigger exists, ignore it.
- Do NOT repeat sentences.
- Be specific.

Return format:
{
  "triggers": {
    "trigger_name": "emotion"
  },
  "insight": "...",
  "suggestion": "..."
}
`;
    console.log(prompt);
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a strict JSON generator. Return ONLY JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let content = response.data.choices[0].message.content;

    try {
      const parsed = JSON.parse(content);

      return res.json({
        success: true,
        message: "Trigger insights generated",
        data: parsed
      });

    } catch (err) {
      return res.json({
        success: false,
        message: "Failed to parse AI response",
        raw: content
      });
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const generateWeeklyAISummary = async (moodCount, dominantMood) => {
  const prompt = `
You are MindMirror AI, a psychological insight engine.

Analyze the user's weekly mood data and return ONLY valid JSON.

Mood distribution:
${JSON.stringify(moodCount)}

Dominant mood: ${dominantMood}

Return format ONLY:
{
  "summary": "...",
  "causes": "...",
  "suggestion": "..."
}

Rules:
- Be empathetic
- Do NOT be medical
- Focus on emotional patterns
- Keep it simple and human
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a strict JSON generator. Return ONLY JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  let content = response.data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (err) {
    return {
      summary: "Unable to generate AI summary",
      causes: "N/A",
      suggestion: "Try again later"
    };
  }
};

const getMoodTimeline = async (req, res) => {
  try {
    const userId = req.user.userId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const moods = await Mood.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const timeline = moods.map(entry => {
  const date = new Date(entry.createdAt);

  const day = date.toLocaleDateString("en-US", {
    weekday: "short"
  });

  const fullDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });

  // INTENSITY SYSTEM (IMPORTANT)
  let intensity = 1;
  let color = "green";

  switch (entry.mood) {
    case "sad":
    case "stressed":
    case "angry":
      intensity = 3;
      color = "red";
      break;

    case "anxious":
    case "overthinking":
    case "confused":
      intensity = 2;
      color = "orange";
      break;

    case "neutral":
    case "calm":
    case "happy":
      intensity = 1;
      color = "green";
      break;

    default:
      intensity = 1;
      color = "blue";
  }

  return {
    date: day,
    fullDate,
    mood: entry.mood,
    intensity,
    color
  };
});

    res.json({
      success: true,
      message: "Timeline generated",
      data: timeline
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getEmotionalProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.find({ userId });

    const moodCount = {};

    messages.forEach(m => {
      moodCount[m.mood] = (moodCount[m.mood] || 0) + 1;
    });

    const total = messages.length;

    let stressScore = (moodCount.stressed || 0) + (moodCount.anxious || 0);
    let happyScore = (moodCount.happy || 0) + (moodCount.excited || 0);

    const stressLevel =
      stressScore / total > 0.5 ? "high" :
      stressScore / total > 0.2 ? "medium" : "low";

    const positivity =
      happyScore / total > 0.5 ? "high" :
      happyScore / total > 0.2 ? "medium" : "low";

    const emotionalStability =
      Object.keys(moodCount).length < 3 ? "low" : "medium";

    const profile = {
      stressLevel,
      positivity,
      emotionalStability,
      dominantMood: Object.keys(moodCount).reduce((a, b) =>
        moodCount[a] > moodCount[b] ? a : b
      )
    };

    res.json({
      success: true,
      message: "Emotional profile generated",
      data: profile
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getMoodInsights,
  getWeeklyInsights,
  getMoodTimeline,
  getTriggerInsights,
  getEmotionalProfile

};