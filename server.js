require('dotenv').config();
const express = require('express'); 
const connection = require('./config/database');
const routeAPI = require('./routes/routeAPI');
const cookieParser = require("cookie-parser");
const app = express(); 
app.use(express.json()); 
app.use(cookieParser()); 
app.use('/api', routeAPI);

(async () => {
  try {
    await connection();
    console.log("Đã kết nối DB thành công!");
  } catch (error) {
    console.error(" Lỗi kết nối DB:", error);
  }
})();

app.listen(process.env.PORT, () => {
  console.log(` Server đang chạy tại cổng ${process.env.PORT}`);
});
