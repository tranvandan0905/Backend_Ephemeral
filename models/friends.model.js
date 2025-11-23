const mongoose = require("mongoose");
const FriendSchema = new mongoose.Schema({
  userId1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userId2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
module.exports = mongoose.model("Friend", FriendSchema);