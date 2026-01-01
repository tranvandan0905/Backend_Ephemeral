const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId1: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    userId2: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    type: {
        type: String,
        required: true,
        enum: ["comment", "addfriend", "like"],
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    content: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
notificationSchema.index({ userId1: 1, isRead: 1 });
notificationSchema.index({ userId1: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", notificationSchema);
