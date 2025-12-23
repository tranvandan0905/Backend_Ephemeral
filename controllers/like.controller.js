
const { handleGetLike, handlePostLike, handleDeleteLike, handleFindLike } = require('../services/like.services');
module.exports = {
    getLike: async (req, res) => {
        try {
            const { postId } = req.params;
            const data = await handleGetLike(postId);
            return res.status(200).json(data);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || "Lỗi server ",
            });
        }
    },
    postlike: async (req, res) => {
        try {
            const userId = req.user._id;
            const { postId } = req.body;
            await handlePostLike(postId, userId);
            return res.status(200).json({
                success: true,
                message: "Like thành công!"

            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || "Lỗi server",
            });
        }
    },

    deletelike: async (req, res) => {
        try {
            const userId = req.user._id;
            const { postId } = req.params;
            const result = await handleDeleteLike(postId, userId);

            return res.status(200).json({
                success: true,
                message: result ? "Đã bỏ like!" : "Bạn chưa like bài viết!",
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || "Lỗi server",
            });
        }
    },
      findlike: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user._id;
            const result = await handleFindLike(postId, userId);
            return res.status(200).json( result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || "Lỗi server",
            });
        }
    },
}