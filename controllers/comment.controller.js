const {
  handleGetComments,
  handleCreateComment,
  handleDeleteComment
} = require("../services/comment.services");

module.exports = {

  getComments: async (req, res) => {
    try {
      const { postId } = req.params;
      const { page, limit } = req.query;
      const data = await handleGetComments(postId, page, limit);

      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Lỗi server"
      });
    }
  },


  createComment: async (req, res) => {
    try {
      const userId = req.user._id;
      const { postId, content, parentId, replyToId } = req.body;
      if (!content)
        throw new Error("Thiếu dữ liệu cmt");


      const post = await handleCreateComment({
        userId,
        postId,
        content,
        parentId,
        replyToId
      });
      req.io.to(post.postId.userId.toString()).emit("new-notification", {
        type: "comment",
        commentId: post._id,   
        parentId: post.parentId || post._id,      
        postId: post.postId._id,
        content: `${post.userId.displayName} đã comment bài viết của bạn.`,
        createdAt: post.createdAt
      });
      return res.status(200).json({
        success: true,
        message: "Bình luận thành công!"
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Lỗi server"
      });
    }
  },


  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user._id;
      await handleDeleteComment(commentId, userId);
      return res.status(200).json({
        success: true,
        message: "Đã xóa bình luận!"
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message || "Lỗi server"
      });
    }
  }
};
