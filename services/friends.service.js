const friendrequest = require("../models/friendrequest.model");
const Friend = require("../models/friends.model");

const createFriend = async (userId1, userId2) => {
    if (userId1 === userId2) throw new Error("Không thể kết bạn với chính mình");

    const exist = await Friend.findOne({
        $or: [
            { userId1: userId1, userId2: userId2 },
            { userId1: userId2, userId2: userId1 } 
        ]
    });
    if (exist) throw new Error("Đã là bạn bè hoặc đã tồn tại");

    const friend = new Friend({ userId1, userId2 });
    await friend.save();
    return friend;
};

const deleteFriend = async (friendId) => {
    const deleted = await Friend.findByIdAndDelete(friendId);
    if (!deleted) throw new Error("Bạn bè không tồn tại");
    return true;
};

const getFriend = async (userId) => {
    const friends = await Friend.find({
        $or: [
            { userId1: userId },
            { userId2: userId }
        ]
    }).populate([
        { path: "userId1", select: "displayName avatarUrl" },
        { path: "userId2", select: "displayName avatarUrl" }
    ]);

    return friends.map(f => {
        const friendUser = f.userId1._id.toString() === userId.toString() ? f.userId2 : f.userId1;
        return {
            friendId: f._id,         
            userId: friendUser._id,    
            displayName: friendUser.displayName,
            avatarUrl: friendUser.avatarUrl
        };
    });
};

module.exports = { createFriend, deleteFriend, getFriend };
