const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat"
  },

  mood: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Mood", moodSchema);