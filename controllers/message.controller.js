const { handecreateMessage, handegetMessagesByConversation } = require("../services/message.service");
const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const image = req.file;
        const { roomId, text } = req.body;
        const message = await handecreateMessage(roomId, userId, text, image);
        req.io.to(roomId).emit("receiveMessage", {
            roomId,                 // string
            message,                // message đầy đủ
            text: message.text,     // để room list dùng
            lastUpdated: message.createdAt
        });
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

        const { page, limit } = req.query;
        const messages = await handegetMessagesByConversation(roomId, page, limit);
        res.status(201).json(messages);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo user",
        });
    }
};

module.exports = { sendMessage, getMessages } 