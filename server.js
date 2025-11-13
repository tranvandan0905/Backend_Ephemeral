require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./config/database");
const routeAPI = require("./routes/routeAPI");

const app = express();

// ✅ Cấu hình CORS cho localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173", // cho phép frontend truy cập
    methods: ["GET", "POST", "PUT", "DELETE"], // các phương thức được phép
    credentials: true, // nếu bạn dùng cookie/session
  })
);

app.use(express.json());

// ✅ Gắn route
app.use("/api", routeAPI);

// ✅ Kết nối DB
(async () => {
  try {
    await connection();
    console.log("✅ Đã kết nối DB thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối DB:", error);
  }
})();

// ✅ Khởi động server
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server đang chạy tại cổng ${process.env.PORT || 5000}`);
});
