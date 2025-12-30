const Notification = require("../models/notification.model");
const createNotification = async ({
  type,
  userId,
  postId = null,
  commentId = null,
  parentId = null,
  content,
}) => {
  if (!type || !content) {
    throw new Error("Thiếu type hoặc content");
  }

  const notification = await Notification.create({
    type,
    postId,
    userId,
    commentId,
    parentId,
    content,
    createdAt: new Date(),
  });

  return notification;
};
const getNotification = async (userId) => {
  const list = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .populate("userId", "displayName avatarUrl")
    .lean();

  return list.map((noti) => ({
    _id: noti._id,
    type: noti.type,
    postId: noti.postId,
    commentId: noti.commentId,
    parentId: noti.parentId,
    content: noti.content,
    createdAt: noti.createdAt,
    userId: noti.userId?._id,
    displayName: noti.userId?.displayName,
    avatarUrl: noti.userId?.avatarUrl,
  }));
};

module.exports = {
  createNotification,
  getNotification
};
