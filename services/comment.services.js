const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const { createNotification } = require("./notification.service");
const handleCreateComment = async ({
  userId,
  postId,
  content,
  parentId = null,
  replyToId = null
}) => {

  // 1. Tạo comment
  const comment = await Comment.create({
    userId,
    postId,
    content,
    parentId,
    replyToId
  });

  // 2. Lấy comment đầy đủ info
  const exist = await Comment.findById(comment._id)
    .populate("postId", "userId")
    .populate("replyToId", "userId")
    .lean();

  if (!exist) return null;

  // 3. COMMENT GỐC → notify chủ post
  if (!parentId) {
    // tăng count
    await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } }
    );

    // không notify chính mình
    if (exist.postId.userId.toString() !== userId.toString()) {
      await createNotification({
        type: "comment",
        userId1: exist.postId.userId, //  người nhận
        userId2: userId,              //  người comment
        postId: exist.postId._id,
        commentId: exist._id,
        content: "đã comment bài viết của bạn"
      });
    }
  }

  // 4. REPLY → notify người được reply
  else if (replyToId && exist.replyToId?.userId) {
    if (exist.replyToId.userId.toString() !== userId.toString()) {
      await createNotification({
        type: "comment",
        userId1: exist.replyToId.userId, // người bị reply
        userId2: userId,                 //  người reply
        postId: exist.postId._id,
        commentId: exist._id,
        content: "đã trả lời comment của bạn"
      });
    }
  }

  return exist;
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
