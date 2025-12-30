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
  const result = await Notification.findOne({ userId });
  return result;
};
module.exports = {
  createNotification,
  getNotification
};
