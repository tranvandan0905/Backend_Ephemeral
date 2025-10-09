const { createRoom } = require("../services/room.sevrice");

exports.createRoomController = async (req, res) => {
  try {
    const userId = req.user.id; 
    const room = await createRoom(userId, req.body);
    res.status(201).json({
      success: true,
      message: "Tạo phòng thành công",
      data: room,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi server khi tạo phòng",
    });
  }
};
