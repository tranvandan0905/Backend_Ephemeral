const Message = require("../models/message.model");
const { uploadToCloudinary } = require("./cloudinary.service");
const { updateLastMessage } = require("./conversation.service");
const { findRoomID } = require("./room.service");
const { FindIDUser } = require("./user.service");

const handecreateMessage = async (roomId, userId, text, image) => {
    const user = await FindIDUser(userId);
    const room_ID = await findRoomID(roomId);
    if (!text && !image) {
        throw new Error("Phải có dữ liệu!");
    }
    let imageUrl = null;
    if (image) {
        const uploadResult = await uploadToCloudinary(image.buffer);
        imageUrl = uploadResult.secure_url;
    }
    const message = new Message({
        roomId: room_ID,
        userId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        text: text || null,
        imageUrl: imageUrl || null
    });

    const [savedMessage, _] = await Promise.all([
        message.save(),
        updateLastMessage(room_ID, userId, text)
    ]);

    return savedMessage;
};

const handegetMessagesByConversation = async (roomId) => {
    const room_ID = await findRoomID(roomId);
    return await Message.find({ roomId: room_ID })
        .sort({ createdAt: 1 })
        .select("userId displayName type text imageUrl createdAt");;
};
module.exports = { handecreateMessage, handegetMessagesByConversation };

