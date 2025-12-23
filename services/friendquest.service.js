const FriendRequest = require("../models/friendrequest.model");
const Friend = require("../models/friends.model");
const User = require("../models/user.model");
const { createFriend } = require("./friends.service");
const createFriendRequest = async (userId, data) => {
    const { receiverId } = data;

    if (userId === receiverId) {
        throw new Error("Không thể gửi lời mời cho chính mình");
    }
    const user  = await User.findById(receiverId);
    if (!user) throw new Error("Không tìm thấy người nhận");

    const existed = await FriendRequest.findOne({
        senderId: userId,
        receiverId
    });

    if (existed) throw new Error("Đã gửi lời mời kết bạn rồi");
    const exist = await Friend.findOne({
        $or: [
            { userId1: userId, userId2: receiverId },
            { userId1: receiverId, userId2: userId }
        ]
    });
    if (exist) throw new Error("Đã là bạn bè hoặc đã tồn tại");

    const friendRequestDoc = new FriendRequest({
        senderId: userId,
        receiverId,
    });

    await friendRequestDoc.save();

    return friendRequestDoc;
};

const updateFriendRequest = async (userId, receiverId, data) => {
    const { status } = data;
    const req = await FriendRequest.findOne({
        $or: [
            { senderId: userId, receiverId: receiverId },
            { senderId: receiverId, receiverId: userId }
        ]
    });


    if (!req) throw new Error("Không tìm thấy lời mời kết bạn");

    if (status === "accepted") {
        await createFriend(userId, receiverId);
        await FriendRequest.findByIdAndDelete(req._id);

        return req;

    } else if (status === "rejected") {
        await FriendRequest.findByIdAndDelete(req._id);
        return true;
    }
    else if (status === "canceled") {
        await FriendRequest.findByIdAndDelete(req._id);
        return true;
    }

    throw new Error("Trạng thái không hợp lệ");
};


const getSentFriendRequests = async (userId) => {
     const requests = await FriendRequest.find({ senderId: userId })
    .populate("receiverId", "displayName avatarUrl")
    .lean();
  return requests.map(r => ({
    receiverId: r.receiverId._id,
    displayName: r.receiverId.displayName,
    avatarUrl: r.receiverId.avatarUrl,
    status: r.status
  })); 
};
const FRIEND_STATUS = {
    FRIEND: "FRIEND",
    SENT: "SENT",
    RECEIVED: "RECEIVED",
    NONE: "NONE",
};

const checkFriend = async (userId, targetUserId) => {
    //Kiểm tra lời mời kết bạn 
    const request = await FriendRequest.findOne({
        $or: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: userId }
        ]
    });

    if (!request) {
        return { status: FRIEND_STATUS.NONE };
    }

    //Phân biệt gửi / nhận
    return {
        status:
            request.senderId.toString() === userId.toString()
                ? FRIEND_STATUS.SENT
                : FRIEND_STATUS.RECEIVED
    };
};


const getReceivedFriendRequests = async (userId) => {
  const requests = await FriendRequest.find({ receiverId: userId })
    .populate("senderId", "displayName avatarUrl")
    .lean();

  return requests.map(r => ({
    receiverId: r.senderId._id,
    displayName: r.senderId.displayName,
    avatarUrl: r.senderId.avatarUrl,
    status: r.status
  }));
};

module.exports = { checkFriend, createFriendRequest, updateFriendRequest, getSentFriendRequests, getReceivedFriendRequests };
