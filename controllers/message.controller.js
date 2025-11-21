const { handecreateMessage, handegetMessagesByConversation } = require("../services/message.service");
const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const image = req.file;
        const { roomId, text } = req.body;
        const message = await handecreateMessage(roomId, userId, text, image);
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

const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const before = parseInt(req.query.before) || Date.now();
        const messages = await handegetMessagesByConversation(roomId,limit,before);
        res.status(201).json(messages);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo user",
        });
    }
};
module.exports = { sendMessage, getMessages } 