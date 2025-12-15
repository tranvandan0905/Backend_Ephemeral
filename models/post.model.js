const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        visibility: {
            type: String,
            enum: ["public", "friends"],
            default: "public"
        },

        isDeleted: {
            type: Boolean,
            default: false
        },
        likesCount: Number,
        commentsCount: Number,
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Post", postSchema);
