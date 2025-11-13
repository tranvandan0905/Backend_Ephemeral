const { handecreateMessage, handegetMessagesByConversation } = require("../services/message.service");
const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const image = req.file;
        const { roomId, text } = req.body;
        const message = await handecreateMessage(roomId,userId,text,image);
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
        const { conversationId } = req.params;
        const messages = await handegetMessagesByConversation(conversationId);
        res.status(201).json({
            success: true,
            message: "Lấy message thành công",
            data: messages,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo user",
        });
    }
};
module.exports = { sendMessage, getMessages } 