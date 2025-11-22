require("dotenv").config();
const express = require("express");
const connection = require("./config/database");
const routeAPI = require("./routes/routeAPI");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const socketHandler = require("./sockets/socket");
const socketIo = require("socket.io");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

// Tạo HTTP server & Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/api", routeAPI);

// Socket
socketHandler(io);

// Database
(async () => {
  try {
    await connection();
    console.log("Đã kết nối DB thành công!");
  } catch (error) {
    console.error("Lỗi kết nối DB:", error);
  }
})();

// Server
server.listen(process.env.PORT, () => {
  console.log(`Server đang chạy tại cổng ${process.env.PORT}`);
});
