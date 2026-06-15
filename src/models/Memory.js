const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  memory: {
    type: String,
    required: true
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Memory", memorySchema);