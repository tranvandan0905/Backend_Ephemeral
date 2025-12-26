const Membership = require("../models/membership.model");
const FriendRequest = require("../models/friendrequest.model");
const Friend = require("../models/friends.model");
const { findRoomID, UpdateRoom } = require("./room.service");
const bcrypt = require("bcryptjs");
const FindMembershipRoomID = async (roomId, userId) => {
  const room = await findRoomID(roomId);

  const members = await Membership.find({ roomId: room._id })
    .populate("userId", "displayName avatarUrl")
    .populate("roomId", "roomId")
    .lean();

  // Danh sách userId trong room 
  const memberUserIds = members
    .map(m => m.userId?._id?.toString())
    .filter(id => id && id !== userId.toString());

  // Lấy danh sách bạn bè
  const friends = await Friend.find({
    $or: [
      { userId1: userId, userId2: { $in: memberUserIds } },
      { userId2: userId, userId1: { $in: memberUserIds } }
    ]
  }).lean();

  const friendSet = new Set(
    friends.map(f =>
      f.userId1.toString() === userId.toString()
        ? f.userId2.toString()
        : f.userId1.toString()
    )
  );

  // Lấy friend request
  const requests = await FriendRequest.find({
    $or: [
      { senderId: userId, receiverId: { $in: memberUserIds } },
      { receiverId: userId, senderId: { $in: memberUserIds } }
    ]
  }).lean();

  const sentSet = new Set(
    requests
      .filter(r => r.senderId.toString() === userId.toString())
      .map(r => r.receiverId.toString())
  );

  const receivedSet = new Set(
    requests
      .filter(r => r.receiverId.toString() === userId.toString())
      .map(r => r.senderId.toString())
  );

  return members.map(m => {
    const targetId = m.userId._id.toString();
    let checkfriend = "NONE";

    if (targetId === userId.toString()) {
      checkfriend = "SELF";
    }
    else if (friendSet.has(targetId)) {
      checkfriend = "FRIEND";
    }
    else if (sentSet.has(targetId)) {
      checkfriend = "SENT";

    }
    else if (receivedSet.has(targetId)) {
      checkfriend = "RECEIVED";

    }

    return {
      userId: m.userId._id,
      displayName: m.userId.displayName,
      avatarUrl: m.userId.avatarUrl,
      roomId: m.roomId.roomId,
      role: m.role,
      expiresAt: m.expiresAt,
      status: m.status,
      joinedAt: m.joinedAt,
      checkfriend,
      receiverId: m.userId._id
    };
  });
};
const deleteMembership = async (roomId,userId) => {
  const room = await findRoomID(roomId);
  if (!room) throw new Error("Room không tồn tại");
  const membership = await Membership.findOneAndDelete({ userId, roomId: room._id });
  if (!membership) {
    throw new Error("Bạn không tham gia phòng này");
  }
  await UpdateRoom(userId, roomId, null, { usersCount: -1 });
  return membership;
};
const findMembershipUserID = async (userId, roomId) => {

  const result = await Membership.findOne({ userId, roomId });
  return result;
};
const createMembership = async (userId, roomId, password) => {
  const room = await findRoomID(roomId);


  if (room.isPrivate) {
    const isMatch = await bcrypt.compare(password, room.passwordHash);
    if (!isMatch) {
      throw new Error("Sai mật khẩu!")
    }
  }
  const membership = new Membership({
    roomId: room._id,
    userId,
    expiresAt: room.expiresAt,
    role: "member",
  });
  await UpdateRoom(userId, roomId, null, { usersCount: 1 });
  await membership.save();
  return membership;


}
const createMembershipfriend = async (userId, roomId, Id) => {
  const room = await findRoomID(roomId);
  if (!room) throw new Error("Room không tồn tại");
  if (room.createdBy != Id && !usersCount) {
    throw new Error("Bạn không phải quản trị room");
  }
  const member = await findMembershipUserID(userId, room._id);
  if (member) {
    throw new Error("Bạn này đã tham gia phòng này rồi!");
  }


  const membership = new Membership({
    roomId: room._id,
    userId,
    expiresAt: room.expiresAt,
    role: "member",
  });
  await UpdateRoom(userId, roomId, null, { usersCount: 1 });
  await membership.save();
  return membership;


}
module.exports = { deleteMembership, createMembershipfriend, FindMembershipRoomID, findMembershipUserID, createMembership }