
const Conversation = require("../models/conversation.model");

const updateLastMessage = async (roomId, userId, text) => {
    const data = await Conversation.findByIdAndUpdate(
        { roomId, userId },
        {
            text,
        },
        { new: true }
    );

    return data;
};

module.exports = { updateLastMessage }