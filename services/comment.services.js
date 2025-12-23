const Comment = require("../models/comment.model");
const Post = require("../models/post.model");

const handleCreateComment = async ({
  userId,
  postId,
  content,
  parentId = null,
  replyToId = null
}) => {
  const comment = await Comment.create({
    userId,
    postId,
    content,
    parentId,
    replyToId
  });
  if (!parentId) {
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true }
    );
  }

  return comment;
};


const handleDeleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment không tồn tại");
  }

  if (comment.userId.toString() !== userId.toString()) {
    throw new Error("Không có quyền xóa comment");
  }

  // soft delete
  comment.isDeleted = true;
  await comment.save();

  // chỉ giảm nếu là comment gốc
  if (!comment.parentId) {
    await Post.findByIdAndUpdate(
      comment.postId,
      { $inc: { commentsCount: -1 } }
    );
  }

  return true;
};

const handleGetComments = async (postId) => {
  const parents = await Comment.find({
    postId,
    parentId: null,
    isDeleted: false
  })
    .populate("userId", "displayName avatarUrl")
    .sort({ createdAt: -1 })
    .lean();

  const replies = await Comment.find({
    postId,
    parentId: { $ne: null },
    isDeleted: false
  })
    .populate("userId", "displayName avatarUrl")
    .populate("replyToId", "userId")
    .sort({ createdAt: 1 })
    .lean();

  // group replies theo parentId
  const replyMap = {};

  replies.forEach(r => {
    const parentKey = r.parentId.toString();
    if (!replyMap[parentKey]) replyMap[parentKey] = [];

    replyMap[parentKey].push({
      replyId: r._id,                     
      commentId: r.parentId,      
      userId: r.userId._id,
      displayName: r.userId.displayName,
      avatarUrl: r.userId.avatarUrl,
      content: r.content,
      replyToUserId: r.replyToId?.userId || null,
      createdAt: r.createdAt
    });
  });

  // build final response
  return parents.map(c => ({
    commentId: c._id,
    userId: c.userId._id,
    displayName: c.userId.displayName,
    avatarUrl: c.userId.avatarUrl,
    content: c.content,
    createdAt: c.createdAt,
    replies: replyMap[c._id.toString()] || []
  }));
};


const deleteCommentMany = async (postId) => {
  return await Comment.updateMany(
    { postId },
    { isDeleted: true }
  );
};

module.exports = {
  handleCreateComment,
  handleDeleteComment,
  handleGetComments,
  deleteCommentMany
};
