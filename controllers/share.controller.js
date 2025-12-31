const { handecreateMessageShare } = require("../services/message.service");

exports.shareController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId, roomId } = req.body;
        const share = await handecreateMessageShare(postId, userId,roomId);
        req.io.to(roomId).emit("receiveMessage", share.savedMessage);
         req.io.to(roomId).emit("updateRoom", share.room);
        res.status(201).json({
            success: true,
            message: "Tạo message thành công",
            data: share.savedMessage,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo user",
        });
    }
};