const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  displayName: { type: String },
  avatarUrl: { type: String },
  type: { type: String, enum: ["text", "image"], default: "text" },
  text: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Message", messageSchema);
