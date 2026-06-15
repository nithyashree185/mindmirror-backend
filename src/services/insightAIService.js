const axios = require("axios");

const generateAIInsights = async (moodCount, dominantMood) => {
  try {
    const prompt = `
You are MindMirror AI.

You analyze a user's emotional history and generate insights.

DATA:
Mood Count: ${JSON.stringify(moodCount)}
Dominant Mood: ${dominantMood}

TASK:
Generate a deep emotional analysis.

Return ONLY valid JSON:

{
  "summary": "short emotional summary",
  "causes": "possible reasons for this emotional pattern",
  "suggestion": "practical advice for improvement"
}

RULES:
- Be human-like and empathetic
- Do NOT be medical advice
- Keep it simple and clear
- Return ONLY JSON
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
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

    let parsed;

try {
  // safer extraction
  const match = content.match(/\{[\s\S]*\}/);

  if (!match) {
    console.log("🔥 GROQ RAW RESPONSE:", response.data.choices[0].message.content);
  }

  parsed = JSON.parse(match[0]);

} catch (err) {
  console.log("RAW GROQ OUTPUT:", content);
  throw err;
}

return parsed;

  } catch (err) {
    console.log("🔥 GROQ ERROR FULL:", err.response?.data || err.message);

    return {
      summary: "Unable to generate insights",
      causes: "N/A",
      suggestion: "Try again later"
    };
  }
};

module.exports = { generateAIInsights };