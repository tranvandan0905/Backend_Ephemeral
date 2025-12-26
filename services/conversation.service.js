
const Conversation = require("../models/conversation.model");
const updateLastMessage = async (roomId, userId, text) => {

    const data = await Conversation.findOneAndUpdate(
        { roomId },  
    {
      $set: {
        text,
        userId: userId,
        lastUpdated: new Date()
      }
    },
   
    );

    return data;
};

const share = async (postId, userId, roomId, text) => {
  // 1️⃣ tìm conversation theo roomId
  let conversation = await Conversation.findOne({ roomId });
  if (conversation) {
    // 2️⃣ update conversation cũ
    conversation.postId = postId;
    conversation.text = text;
    conversation.userId = userId;
    conversation.lastUpdated = new Date();

    await conversation.save();
    return conversation;
  }
};


module.exports = { share, updateLastMessage }