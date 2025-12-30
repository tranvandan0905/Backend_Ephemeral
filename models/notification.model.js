const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
     
    },
    type: {
        type: String,
        required: true,
        enum: ["comment", "addfriend", "like"],
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
          required: true,
    },

    commentId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    content: {
    type: String,
    required: true,
   },

    createdAt: {
    type: Date,
    default: Date.now,
},
});

module.exports = mongoose.model("Notification", notificationSchema);
