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
const handleGetComments = async (postId, page = 1, limit = 5) => {
  page = Number(page) || 1;
  limit = Number(limit) || 5;
  const skip = (page - 1) * limit;


  const totalParents = await Comment.countDocuments({
    postId,
    parentId: null,
  });


  const parents = await Comment.find({
    postId,
    parentId: null,
  })
    .populate("userId", "displayName avatarUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const parentIds = parents.map(p => p._id);


  const replies = await Comment.find({
    postId,
    parentId: { $in: parentIds },
  })
    .populate("userId", "displayName avatarUrl")
    .populate({
      path: "replyToId",
      populate: {
        path: "userId",
        select: "displayName avatarUrl",
      },
    })
    .sort({ createdAt: 1 })
    .lean();


  const replyMap = {};
  replies.forEach(r => {
    const key = r.parentId.toString();
    if (!replyMap[key]) replyMap[key] = [];

    replyMap[key].push({
      id: r._id,
      parentId: r.parentId, 
      userId: r.userId._id,
      displayName: r.userId.displayName,
      avatarUrl: r.userId.avatarUrl,
      content: r.content,
      replyToUserId: r.replyToId?.userId?._id || null,
      replyToDisplayName: r.replyToId?.userId?.displayName || null,
      createdAt: r.createdAt,
    });
  });

  // 5️⃣ Build response GIỐNG FORMAT CŨ
  const data = parents.map(c => ({
    id: c._id,
    parentId: c._id, 
    userId: c.userId._id,
    displayName: c.userId.displayName,
    avatarUrl: c.userId.avatarUrl,
    content: c.content,
    createdAt: c.createdAt,
    replies: replyMap[c._id.toString()] || [],
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total: totalParents,
      totalPages: Math.ceil(totalParents / limit),
      hasNextPage: page * limit < totalParents,
      hasPrevPage: page > 1,
    },
  };
};


const handleDeleteCommentPostMany = async (postId) => {
  return await Comment.deleteMany(
    { postId }
  );
};

const handleDeleteComment = async (commentId, userId) => {
  // 1. Lấy comment đang bị xóa
  const targetComment = await Comment.findById(commentId);
  if (!targetComment) {
    throw new Error("Comment không tồn tại");
  }

  // 2. Nếu là COMMENT CHA
  if (!targetComment.parentId) {
    if (targetComment.userId.toString() !== userId.toString()) {
      throw new Error("Bạn không có quyền xóa comment này");
    }

    // Xóa cha + toàn bộ con
    return await Comment.deleteMany({
      $or: [
        { _id: targetComment._id },
        { parentId: targetComment._id },
        { replyToId: targetComment._id }
      ]
    });
  }


  if (targetComment.userId.toString() !== userId.toString()) {
    throw new Error("Bạn không có quyền xóa reply này");
  }

  return await Comment.deleteOne({ _id: targetComment._id });
};


module.exports = {
  handleCreateComment,
  handleDeleteCommentPostMany,
  handleGetComments,
  handleDeleteComment

};
