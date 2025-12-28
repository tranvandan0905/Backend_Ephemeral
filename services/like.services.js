const Like = require('../models/like.model');
const Post = require("../models/post.model");
const handlePostLike = async (postId, userId) => {
    const existing = await Like.findOne({ postId, userId })
        .populate("postId", "userId content")
        .populate("userId", "displayName avatarUrl")
        .lean();
    if (existing) {
        throw new Error("Bạn đã like bài viết này");
    }
    await Like.create({ postId, userId });
    await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } },
        { new: true }
    );
    const exist = await Like.findOne({ postId, userId })
        .populate("postId", "userId content")
        .populate("userId", "displayName avatarUrl")
        .lean();

    return exist;
};
const handleFindLike = async (data, userId) => {
    if (!userId) {
        return data.map(item => ({
            postId: item.postId,
            isLiked: false
        }));
    }
    //  Lấy danh sách postId
    const postIds = data.map(item => item.postId);

    //  Lấy tất cả like của user cho các post này
    const userLikes = await Like.find({
        postId: { $in: postIds },
        userId
    })
        .select("postId")
        .lean();

    // Convert sang Set để check nhanh
    const likedPostIds = new Set(
        userLikes.map(like => like.postId.toString())
    );

    // Map lại data trả về
    const result = data.map(item => ({
        postId: item.postId,
        isLiked: likedPostIds.has(item.postId.toString())
    }));

    return result;
};
const handlecheckLike = async (postId, userId) => {
    const existing = await Like.findOne({ postId, userId }).lean();
    return !!existing;
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
    return await Like.deleteMany({ postId });
}
const handleGetLike = async (postId) => {
    const data = await Like.find({ postId }).populate("userId", "displayName avatarUrl").lean();
    return data.map(r => ({
        displayName: r.userId.displayName,
        avatarUrl: r.userId.avatarUrl,
    }));
}
module.exports = {handlecheckLike, handleGetLike, handlePostLike, handleDeleteLike, deletelikeMany, handleFindLike };