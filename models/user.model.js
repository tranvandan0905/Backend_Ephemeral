const mongoose = require("mongoose");

const authProviderSchema = new mongoose.Schema({
  provider: { type: String, enum: ["google", "facebook"], required: true },
  providerId: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email: { type: String, default: null },
  avatarUrl: { type: String },
  passwordHash: { type: String },
  authProviders: [authProviderSchema],
  roles: { type: String, default: "user" },

  school: { type: String },
  currentCity: { type: String },
  hometown: { type: String },
  relationshipStatus: {
    type: String,
    enum: ["single", "in_relationship", "married", "complicated"],
    default: "single"
  },
  birthday: { type: Date },
  website: { type: String },
  phoneNumber: { type: String },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
