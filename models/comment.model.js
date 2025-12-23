const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },

    content: {
      type: String,
      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },

    replyToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
  }, { timestamps: true });
commentSchema.index({ parentId: 1 });
commentSchema.index({ replyToId: 1 });
commentSchema.index({ postId: 1 });
commentSchema.index({ userId: 1 });
module.exports = mongoose.model("Comment", commentSchema);
