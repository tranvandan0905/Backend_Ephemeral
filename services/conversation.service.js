
const Conversation = require("../models/conversation.model");

const updateLastMessage = async (room_ID, userId, text) => {

    const data = await Conversation.findOneAndUpdate(
        { roomId: room_ID, userId },
        { text: text },
        { new: true }
    );

    return data;
};

module.exports = { updateLastMessage }