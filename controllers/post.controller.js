const { createPost, getPostByUserId, getPost } = require("../services/post.service");

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
        const userId = req.user._id;
        const post = await getPostByUserId(userId);
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
        const post = await getPost();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
};