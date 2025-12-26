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


const getSentFriendRequests = async (userId, page = 1, limit = 10) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const skip = (page - 1) * limit;

  const query = { senderId: userId };

  // 🔹 Tổng số request đã gửi
  const total = await FriendRequest.countDocuments(query);

  if (total === 0) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  const requests = await FriendRequest.find(query)
    .populate("receiverId", "displayName avatarUrl")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const data = requests.map(r => ({
    receiverId: r.receiverId?._id || null,
    displayName: r.receiverId?.displayName || null,
    avatarUrl: r.receiverId?.avatarUrl || null,
    status: r.status
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
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


const getReceivedFriendRequests = async (userId, page = 1, limit = 10) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const skip = (page - 1) * limit;

  const query = { receiverId: userId };

  // 🔹 Tổng số request nhận được
  const total = await FriendRequest.countDocuments(query);

  if (total === 0) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }

  const requests = await FriendRequest.find(query)
    .populate("senderId", "displayName avatarUrl")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const data = requests.map(r => ({
    senderId: r.senderId?._id || null,
    displayName: r.senderId?.displayName || null,
    avatarUrl: r.senderId?.avatarUrl || null,
    status: r.status
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

module.exports = { checkFriend, createFriendRequest, updateFriendRequest, getSentFriendRequests, getReceivedFriendRequests };
