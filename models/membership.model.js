const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  nickname: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ["creator", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["active", "left", "banned"],
    default: "active",
  },
});

membershipSchema.index({ userId: 1, roomId: 1 }, { unique: true });

module.exports = mongoose.model("Membership", membershipSchema);
