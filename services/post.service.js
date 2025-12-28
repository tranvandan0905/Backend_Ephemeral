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
const getPostByUserId = async (userId, page = 1, limit = 10) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const skip = (page - 1) * limit;

  const query = {
    userId,
    isDeleted: false
  };

  // 🔹 Tổng số bài viết
  const total = await Post.countDocuments(query);

  if (total === 0) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  // 🔹 Lấy bài viết theo page
  const posts = await Post.find(query)
    .populate("userId", "displayName avatarUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const data = posts.map(post => ({
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

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

const getPost = async (page = 1, limit = 10) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;
  const skip = (page - 1) * limit;

  const query = {
    visibility: "public",
    isDeleted: false
  };

  // 🔹 Tổng số post
  const total = await Post.countDocuments(query);

  // 🔹 Lấy post theo trang
  const posts = await Post.find(query)
    .populate("userId", "displayName avatarUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const data = posts.map(post => ({
    _id: post._id,
    userId: post.userId._id,
    displayName: post.userId.displayName,
    avatarUrl: post.userId.avatarUrl,
    content: post.content,
    visibility: post.visibility,
    isDeleted: post.isDeleted,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    shareCount: post.shareCount || 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,

  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

const getfindPost = async (postId) => {
  const post =
    await Post.findOne({
      _id: postId,
      isDeleted: false
    })
      .populate("userId", "displayName avatarUrl")
  return {
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
    shareCount: post.shareCount || 0,
  };
}
module.exports = {
  createPost, getPostByUserId, getPost, getfindPost
}
