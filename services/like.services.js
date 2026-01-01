const Like = require('../models/like.model');
const Post = require("../models/post.model");
const { createNotification, deleteNotificationsByPostAndUser, findOneNotification } = require('./notification.service');
const handlePostLike = async (postId, userId) => {

    const like = await Like.create({ postId, userId });

    const post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: 1 } },
        { new: true }
    ).populate("userId", "_id");

    if (post.userId !== userId) {
        const content =
            post.likesCount === 1
                ? "đã thích bài viết của bạn"
                : `và ${post.likesCount - 1} người khác đã thích bài viết của bạn`;

        await deleteNotificationsByPostAndUser(postId, post.userId);

        const data = await createNotification({
            type: "like",
            userId1: post.userId,
            userId2: userId,
            postId: post._id,
            content
        });

        if (data) {
            const notification = await findOneNotification(data._id);
            return { notification, userNotifyId: post.userId._id };
        }
    }
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
module.exports = { handlecheckLike, handleGetLike, handlePostLike, handleDeleteLike, deletelikeMany, handleFindLike };