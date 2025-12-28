
const User = require('../models/user.model')
const Room = require("../models/room.model");
const bcrypt = require("bcryptjs");
const Friend = require("../models/friends.model");
const { uploadToCloudinary } = require('./cloudinary.service');
const { checkFriend } = require('./friendquest.service');
const createUser = async (displayName, email, password) => {
  const checkemail = await User.findOne({ email });
  if (checkemail)
    throw new Error("Email đã tồn tại!");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ displayName, email, passwordHash })
  await user.save();
  return user;
}
const FindIDUser = async (_id) => {
  const result = await User.findById(_id);
  return result;
};
const updateUser = async (userId, displayName, avatarUrl) => {
  const user = await FindIDUser(userId);

  const result = await User.updateOne(
    { _id: userId },
    {
      displayName: displayName || user.displayName,
      avatarUrl: avatarUrl || user.avatarUrl
    }
  );

  return result;
};

const updateavatar = async (userId, avatar) => {
  if (!avatar) {
    throw new Error("Không có file avatar!");
  }

  const uploadResult = await uploadToCloudinary(avatar.buffer);
  const avatarUrl = uploadResult.secure_url;

  if (!avatarUrl) {
    throw new Error("Cập nhật avatar thất bại!");
  }
  await updateUser(userId, null, avatarUrl);

  return avatarUrl;
};
const isEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
const searchUser = async (userId, keyword) => {
  if (!keyword) return [];
  const userIdStr = userId.toString();

  // Search theo email
  if (isEmail(keyword)) {
    const user = await User.findOne({
      email: keyword.toLowerCase()
    }).select("_id displayName avatarUrl").lean();

    if (!user) return [];

    const isFriend = await checkFriend(userIdStr, user._id.toString());

    return [
      {
        ...user,
        checkfriend: isFriend.status
      }
    ];
  }

  // Search theo tên trong friend
  const friends = await Friend.find({
    $or: [
      { userId1: userId },
      { userId2: userId }
    ]
  }).lean();
  const friendIds = friends
    .map(f =>
      f.userId1.toString() === userIdStr
        ? f.userId2
        : f.userId1
    )
    .filter(id => id.toString() !== userIdStr);
  const users = await User.find({
    _id: { $in: friendIds },
    displayName: { $regex: keyword, $options: "i" }
  }).select("_id displayName avatarUrl");
  const roomsFlatten = await Promise.all(
    users.map(async (m) => {
      const room = await Room.findOne({
        $or: [
          { createdBy: userId, participant: m._id },
          { participant: userId, createdBy: m._id }
        ]
      }).lean();
      return {
        ...m.toObject(),
        roomId: room.roomId
      };
    })
  );
  return roomsFlatten;
};



const updateUserAbout = async (userId, payload) => {
  const allowedFields = [
    "school",
    "currentCity",
    "hometown",
    "relationshipStatus",
    "birthday",
    "website",
    "phoneNumber",
    "job",
  ];

  const updateData = {};

  allowedFields.forEach(field => {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new Error("Không có dữ liệu hợp lệ để cập nhật");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  ).select(
    "school currentCity hometown relationshipStatus birthday website phoneNumber"
  );

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return user;
};


module.exports = { updateUserAbout, createUser, FindIDUser, updateavatar, searchUser };