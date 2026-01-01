const Notification = require("../models/notification.model");
const createNotification = async ({
  type,
  userId1,
  userId2,
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
    userId1,
    userId2,
    postId,
    commentId,
    parentId,
    content,
    createdAt: new Date(),
  });

  return notification;
};
const getNotification = async (userId1) => {
  const list = await Notification.find({ userId1 })
    .sort({ createdAt: -1 })
    .populate("userId2", "displayName avatarUrl")
    .lean();
  const unreadCount = await Notification.countDocuments({
    userId1,
    isRead: false
  });

  return {
    unreadCount,
    notifications: list.map((noti) => ({
      _id: noti._id,
      type: noti.type,
      postId: noti.postId,
      commentId: noti.commentId,
      content: noti.content,
      isRead: noti.isRead,
      createdAt: noti.createdAt,
      userId: noti.userId2?._id,
      displayName: noti.userId2?.displayName,
      avatarUrl: noti.userId2?.avatarUrl,
    }))
  };
};
const deleteNotificationsByPostAndUser = async (postId, userId2) => {
  if (!postId || !userId2) return;

  return await Notification.deleteMany({ postId, userId2 });
};
const CheckNotification = async (userId1) => {
  const result = await Notification.updateMany(
    { userId1, isRead: false },
    { $set: { isRead: true } }
  );

  return result.modifiedCount > 0;
};

module.exports = {
  createNotification,
  getNotification,
  deleteNotificationsByPostAndUser,
  CheckNotification
};
