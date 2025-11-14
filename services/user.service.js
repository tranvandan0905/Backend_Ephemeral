
const User = require('../models/user.model')
const bcrypt = require("bcryptjs");
const { uploadToCloudinary } = require('./cloudinary.service');
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

module.exports = { createUser, FindIDUser, updateavatar };