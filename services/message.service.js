const Message = require("../models/message.model");
const { uploadToCloudinary } = require("./cloudinary.service");
const { updateLastMessage } = require("./conversation.service");

const handecreateMessage = async (roomId, userId, text, image) => {
    const user = await FindIDUser(userId);
    if (!text && !image) {
        throw new Error("Phải có dữ liệu!");
    }
    let imageUrl = null;
    if (image) {
        const uploadResult = await uploadToCloudinary(image.buffer);
        imageUrl = uploadResult.secure_url;
    }
    const message = new Message({
        roomId,
        userId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        text: text || null,
        imageUrl: imageUrl || null
    });

    const [savedMessage, _] = await Promise.all([
        message.save(),
        updateLastMessage(roomId,userId, text)
    ]);

    return savedMessage;
};

const handegetMessagesByConversation = async (roomId) => {
    return await Message.find({ roomId }).sort({ createdAt: 1 });
};
module.exports = { handecreateMessage, handegetMessagesByConversation };

