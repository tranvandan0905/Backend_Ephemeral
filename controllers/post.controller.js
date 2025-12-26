const { createPost, getPostByUserId, getPost, getfindPost } = require("../services/post.service");

exports.createPostController = async (req, res) => {
    try {
        const userId = req.user._id;
        const post = await createPost(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Tạo Post thành công",
            data: post,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo Post",
        });
    }
};
exports.getPostByUserIdController = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const userId = req.user._id;
        const post = await getPostByUserId(userId, page, limit);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
};
exports.getPostController = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const post = await getPost(page, limit);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
};
exports.getfindPostController = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await getfindPost(postId);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
};
