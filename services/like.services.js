const Like = require('../models/like.model');
const Post = require("../models/post.model");
const handlePostLike = async (postId, userId) => {
    const existing = await Like.findOne({ postId, userId });
    if (existing) {
        throw new Error("Bạn đã like bài viết này");
    }

    await Like.create({ postId, userId });

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } },
        { new: true }
    );

    return true;
};

const handleDeleteLike = async (postId, userId) => {
    const deleted = await Like.findOneAndDelete({ postId, userId });

    if (!deleted) {
        throw new Error("Bạn chưa like bài viết này");
    }

    await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: -1 } },
        { new: true }
    );

    return true; 
};


const deletelikeMany = async (postId) => {
    return await like.deleteMany({ postId });
}
const handleGetLike = async (postId) => {
    const data = await Like.find({ postId }).populate("userId", "displayName avatarUrl").lean();
    return data.map(r => ({
        displayName: r.userId.displayName,
        avatarUrl: r.userId.avatarUrl,
    }));
}
module.exports = { handleGetLike, handlePostLike, handleDeleteLike, deletelikeMany };