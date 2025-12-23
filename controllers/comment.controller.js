const {
  handleGetComments,
  handleCreateComment,
  handleDeleteComment
} = require("../services/comment.services");

module.exports = {

  getComments: async (req, res) => {
    try {
      const { postId } = req.params;
      const data = await handleGetComments(postId);

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


      await handleCreateComment({
        userId,
        postId,
        content,
        parentId,
        replyToId
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
