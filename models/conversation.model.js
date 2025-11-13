
const mongoose = require("mongoose");
const ConversationSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: String,
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", ConversationSchema);
