const mongoose = require("mongoose");

const streakSchema = new mongoose.Schema({
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
unique: true
},

currentStreak: {
type: Number,
default: 1
},

longestStreak: {
type: Number,
default: 1
},

totalJournalDays: {
type: Number,
default: 1
},

lastEntryDate: {
type: Date,
default: Date.now
}
});

module.exports = mongoose.model("Streak", streakSchema);
