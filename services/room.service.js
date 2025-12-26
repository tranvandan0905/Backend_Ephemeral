const Room = require("../models/room.model");
const Membership = require("../models/membership.model");
const User = require("../models/user.model");
const { nanoid } = require("nanoid");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");
const { uploadToCloudinary, deleteFromCloudinary } = require("./cloudinary.service");
const Conversation = require("../models/conversation.model");

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
const findRoomID = async (roomId) => {
  const result = await Room.findOne({ roomId });
  return result;
};
const createRoomUser = async (userId, participant) => {
  try {
    // Sinh roomId ngắn
    const roomId = nanoid(10);
    const room = new Room({
      roomId,
      usersCount: 2,
      createdBy: userId,
      participant,
    });

    await room.save();

    const membershipcreatedBy = new Membership({
      roomId: room._id,
      userId,
    });
    const membershipparticipant = new Membership({
      roomId: room._id,
      userId: participant,
    });
    const conversation = new Conversation({
      roomId: room._id,
      userId,
      text: "Chưa có tin nhắn nào!"
    })
    await conversation.save();
    await membershipcreatedBy.save();
    await membershipparticipant.save();
    return room;
  } catch (error) {
    console.error("Lỗi khi tạo room:", error);
    throw new Error("Không thể tạo room");
  }
};
const createRoom = async (userId, avatar, roomData) => {
  try {
    const { name, expiresAt, password } = roomData;
    let isPrivate = false;
    // Hash mật khẩu nếu là phòng riêng tư
    let passwordHash = null;
    if (password) {
      isPrivate = true
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Sinh roomId ngắn
    const roomId = nanoid(10);

    // Tạo QR code cho room
    const qrCode = await generateRoomQRCode(roomId);

    // Validate expiresAt 
    const expireDate = expiresAt ? new Date(expiresAt) : null;
    let avatarUrl = null;
    if (avatar) {
      const uploadResult = await uploadToCloudinary(avatar.buffer);
      avatarUrl = uploadResult.secure_url;
    }
    const room = new Room({
      roomId,
      name,
      avatar: avatarUrl || null,
      passwordHash,
      qrCode,
      usersCount: 1,
      isPrivate: isPrivate,
      expiresAt: expireDate,
      createdBy: userId,
    });

    await room.save();

    // Tạo membership /conversation cho chủ phòng
    const user = await User.findById(userId);
    if (user) {
      const membership = new Membership({
        roomId: room._id,
        userId,
        expiresAt: expireDate,
        role: "creator",
      });
      const conversation = new Conversation({
        roomId: room._id,
        userId,
        text: "Chưa có tin nhắn nào!"
      })
      await conversation.save();
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
      avatar: room.avatar,
      qrCode: room.qrCode,
      isPrivate: room.isPrivate,
      expiresAt: room.expiresAt,
      createdBy: room.createdBy,
      usersCount: room.usersCount,
      createdAt: room.createdAt,
      password: room.passwordHash
    };

    return roomData;
  } catch (error) {
    console.error("Lỗi trong service getRoomByRoomId:", error);
    throw error;
  }
};
const getRoomsByUserID = async (userId) => {
  try {
    const memberships = await Membership.find({
      userId,
      status: "active"
    })
      .populate({
        path: "roomId",
        select: "roomId name avatar participant usersCount isPrivate",
        populate: {
          path: "participant",
          select: "displayName avatarUrl"
        }
      })
      .lean();

    if (!memberships.length) return [];

    const roomsFlatten = await Promise.all(
      memberships.map(async (membership) => {
        const room = membership.roomId;
        if (!room) return null;

        const conversation = await Conversation.findOne({
          roomId: room._id
        })
          .sort({ lastUpdated: -1 })
          .populate("userId", "displayName")
          .lean();

        return {
          roomId: room.roomId,

          // ✅ SAFE
          participant: room.participant?.displayName || null,
          avatarUrl: room.participant?.avatarUrl || null,

          name: room.name || null,
          avatar: room.avatar || null,

          displayName: conversation?.userId?.displayName || null,
          text: conversation?.text || "Chưa có tin nhắn nào!",
          lastUpdated: conversation?.lastUpdated || null,
        };
      })
    );

    return roomsFlatten.filter(Boolean);

  } catch (error) {
    console.error("Lỗi trong service getRoomsByUserID:", error);
    throw error;
  }
};


const UpdateRoom = async (userId, roomId, avatar, roomData = {}) => {

  const { name, description, expiresAt, usersCount } = roomData;

  const room = await findRoomID(roomId);
  if (!room) throw new Error("Room không tồn tại");
  if (room.createdBy != userId && !usersCount) {
    throw new Error("Bạn không phải quản trị room");
  }
  // Xử lý avatar upload & delete
  let avatarUrl = room.avatar;
  if (avatar) {
    const uploadResult = await uploadToCloudinary(avatar.buffer);
    avatarUrl = uploadResult.secure_url;

    // Xóa avatar cũ nếu tồn tại
    if (room.avatar) {
      await deleteFromCloudinary(room.avatar);
    }
  }

  // Xử lý expiresAt
  let expireDate = room.expiresAt;
  if (expiresAt) {
    const d = new Date(expiresAt);
    if (!isNaN(d.getTime())) expireDate = d;
  }
  let Count = room.usersCount;
  if (usersCount !== undefined && usersCount !== null) {
    Count = room.usersCount + usersCount;
  }
  const roomUpdateData = {
    name: name || room.name,
    description: description || room.description,
    avatar: avatarUrl,
    passwordHash: room.passwordHash,
    qrCode: room.qrCode,
    usersCount: Count ?? room.usersCount,
    isPrivate: room.isPrivate,
    expiresAt: expireDate,
    createdBy: room.userId,
  };

  await Room.updateOne({ _id: room._id }, { $set: roomUpdateData });


};
const UpdateRoompassword = async (userId, roomId, roomData = {}) => {

  const { password } = roomData;

  const room = await findRoomID(roomId);
  if (!room) throw new Error("Room không tồn tại");
  if (room.createdBy != userId) {
    throw new Error("Bạn không phải quản trị room");
  }

  let isPrivate = false;
  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
    isPrivate = true;
  }
  const roomUpdateData = {
    passwordHash,
    isPrivate,
  };

  await Room.updateOne({ _id: room._id }, { $set: roomUpdateData });


};

module.exports = {
  createRoom, getRoomByRoomId, getRoomsByUserID, findRoomID, UpdateRoom, UpdateRoompassword, createRoomUser
};
