const Membership = require("../models/membership.model");
const { findRoomID } = require("./room.service");
const { FindIDUser } = require("./user.service");
const bcrypt = require("bcryptjs");
const FindMembershipRoomID = async (roomId) => {
    const roomID = await findRoomID(roomId);
    const result = await Membership.find({ roomId: roomID })
        .populate("userId", "displayName avatarUrl")
        .lean();

    return result.map(m => ({
        userId: m.userId._id,
        displayName: m.userId.displayName,
        avatarUrl: m.userId.avatarUrl,
        roomId: m.roomId,
        role: m.role,
        expiresAt: m.expiresAt,
        status: m.status,
        joinedAt: m.joinedAt
    }));
};
const findMembershipUserID = async (userId) => {
    const result = await Membership.findOne({ userId });
    return result;
};
const createMembership = async (userId, roomId, password) => {
    const room = await findRoomID(roomId);
    const user = await FindIDUser(userId);
    const checkmembership = await findMembershipUserID(userId)
    if (checkmembership) {
        throw new Error("Bạn đã tham gia phòng!")
    }
    if (room.isPrivate) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
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
    await membership.save();
    return membership;


}
module.exports = { FindMembershipRoomID, findMembershipUserID, createMembership }