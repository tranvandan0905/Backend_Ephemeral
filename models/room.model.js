const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String },
  description: { type: String },
  passwordHash: { type: String },
  avatar: { type: String },
  qrCode: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiresAt: { type: Date },
  usersCount: { type: Number, default: 0 },
  isPrivate: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Room", roomSchema);
