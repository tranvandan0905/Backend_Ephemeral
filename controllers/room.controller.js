const { createRoom, getRoomByRoomId, getRoomsByUserID} = require("../services/room.service");

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
exports.getRoomByRoomIdController = async (req, res) => {
    try {
        const { roomId } = req.params;
        const roomData = await getRoomByRoomId(roomId);

        if (!roomData) {
            return res.status(404).json({ message: "Phòng không tồn tại" });
        }

        res.status(200).json({
            success: true,
            data: roomData,
            message: "Tìm phòng thành công",
        });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin phòng:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};
exports.findRoomController = async (req, res) => {
    try {
        const userId = req.user.id;
        const roomData = await getRoomsByUserID(userId);
        res.status(200).json({
            success: true,
            message: "Lấy Data phòng thành công",
            data: roomData,
        })
    } catch (error) {
        console.error("Lỗi khi lấy thông tin phòng:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
}