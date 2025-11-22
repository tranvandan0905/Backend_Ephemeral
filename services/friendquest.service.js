const FriendRequest = require("../models/friendrequest.model");

const createFriendRequest = async (userId, data) => {
    const { receiverId } = data;

    const friendRequestDoc = new FriendRequest({
        senderId: userId,       
        receiverId: receiverId, 
        status: "pending"       
    });

    await friendRequestDoc.save();

    return friendRequestDoc;   
};

module.exports = { createFriendRequest };
