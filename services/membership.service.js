const Membership = require("../models/membership.model");
const { findRoomID } = require("./room.service");

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

module.exports = { FindMembershipRoomID }