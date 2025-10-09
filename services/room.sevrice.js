const Room = require("../models/room.model");
const Membership = require("../models/membership.model");
const User = require("../models/user.model");
const { nanoid } = require("nanoid");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");

const generateRoomQRCode = async (roomId) => {
  try {
    const base = process.env.BASE_URL;
    const linkQR = `${base}/${roomId}`;
    const qrDataURL = await QRCode.toDataURL(linkQR);
    return qrDataURL;
  } catch (err) {
    console.error("Lỗi khi tạo QR:", err);
    return null;
  }
};

const createRoom = async (userId, roomData) => {
  try {
    const { name, description, avatar, isPrivate, expiresAt, password } = roomData;

    // Hash mật khẩu nếu là phòng riêng tư
    let passwordHash = null;
    if (isPrivate && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Sinh roomId ngắn
    const roomId = nanoid(10);

    // Tạo QR code cho room
    const qrCode = await generateRoomQRCode( roomId);

    // Validate expiresAt 
    const expireDate = expiresAt ? new Date(expiresAt) : null;
    const room = new Room({
      roomId,
      name,
      description,
      avatar: avatar || null,
      passwordHash,
      qrCode,
      usersCount: 1,
      isPrivate: isPrivate || false,
      expiresAt: expireDate,
      createdBy: userId,
    });

    await room.save();

    // Tạo membership cho chủ phòng
    const user = await User.findById(userId);
    if (user) {
      const membership = new Membership({
        roomId: room._id,
        userId,
        avatar: user.avatarUrl,
        nickname: user.displayName,
        role: "creator",
      });
      await membership.save();
    }

    return room;
  } catch (error) {
    console.error("Lỗi khi tạo room:", error);
    throw new Error("Không thể tạo room");
  }
};
const getRoomByRoomId = async (roomId) => {
  try {
    const room = await Room.findOne({ roomId })
      .populate("createdBy", "displayName avatarUrl");

    if (!room) return null;
    const roomData = {
      roomId: room.roomId,
      name: room.name,
      description: room.description,
      avatar: room.avatar,
      qrCode: room.qrCode,
      isPrivate: room.isPrivate,
      expiresAt: room.expiresAt,
      createdBy: room.createdBy,
      usersCount: room.usersCount,
      createdAt: room.createdAt,
    };

    return roomData;
  } catch (error) {
    console.error("Lỗi trong service getRoomByRoomId:", error);
    throw error;
  }
};
module.exports = {
  createRoom,getRoomByRoomId
};
