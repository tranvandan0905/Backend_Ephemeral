const jwt = require("jsonwebtoken");
const { handecreateMessage } = require("../services/message.service");
module.exports = (io) => {
  const onlineUsers = {};

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) return next(new Error("Không tìm thấy cookie"));

    const token = cookies
      .split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return next(new Error("Không có token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Token không hợp lệ"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id;
    onlineUsers[userId] = socket.id;
    console.log(`${userId} đã kết nối`);
    socket.join(userId.toString());
    // Join room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`${userId} đã join room ${roomId}`);
    });


    socket.on("disconnect", () => {
      console.log(`${userId} đã ngắt`);
      delete onlineUsers[userId];
    });
  });
};
