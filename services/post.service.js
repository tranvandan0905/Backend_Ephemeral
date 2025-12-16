const Post = require("../models/post.model");

const createPost = async (userId, postData) => {
    try {
        if (!postData.content || postData.content.trim() === "") {
            throw new Error("Nội dung bài post không được để trống");
        }

        const newPost = new Post({
            userId,
            content: postData.content,
            visibility: postData.visibility || "public",
            isDeleted: false,
            likesCount: 0,
            commentsCount: 0,
        });

        await newPost.save();
        return newPost;
    } catch (error) {
        throw error;
    }
};
const getPostByUserId = async (userId) => {
    const posts = await Post.find({
        userId,
        isDeleted: false
    })
    .populate("userId", "displayName avatarUrl")
    .sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
        _id: post._id,
        userId: post.userId._id,
        displayName: post.userId.displayName,
        avatarUrl: post.userId.avatarUrl,
        content: post.content,
        visibility: post.visibility,
        isDeleted: post.isDeleted,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    }));

    return formattedPosts;
};
const getPost = async () => {
    const posts = await Post.find({
        visibility: "public",
        isDeleted: false
    })
    .populate("userId", "displayName avatarUrl")
    .sort({ createdAt: -1 });
    const formattedPosts = posts.map(post => ({
        _id: post._id,
        userId: post.userId._id,
        displayName: post.userId.displayName,
        avatarUrl: post.userId.avatarUrl,
        content: post.content,
        visibility: post.visibility,
        isDeleted: post.isDeleted,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    }));

    return formattedPosts;
};

module.exports = {
    createPost,getPostByUserId,getPost
}
