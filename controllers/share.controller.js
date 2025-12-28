const { handecreateMessageShare } = require("../services/message.service");

exports.shareController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId, roomId } = req.body;
        const message = await handecreateMessageShare(postId, userId,roomId);
        req.io.to(roomId).emit("receiveMessage", message);
        res.status(201).json({
            success: true,
            message: "Tạo message thành công",
            data: message,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo user",
        });
    }
};