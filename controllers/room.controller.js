
const { createRoom, getRoomByRoomId, getRoomsByUserID, UpdateRoom, UpdateRoompassword, searchRoom } = require("../services/room.service");

exports.createRoomController = async (req, res) => {
    try {
        const userId = req.user._id;
        const avatar = req.file;
        const room = await createRoom(userId, avatar, req.body);
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
        const userId = req.user._id;
        const roomData = await getRoomByRoomId(roomId, userId);

        if (!roomData) {
            return res.status(404).json({ message: "Phòng không tồn tại" });
        }

        res.status(200).json(roomData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo phòng",
        });
    }
};
exports.findRoomController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { keyword } = req.query;
        const roomData = await getRoomsByUserID(userId, keyword);
        res.status(200).json(roomData)
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo phòng",
        });
    }
}
exports.UpdateRoomController = async (req, res) => {
    try {
        const userId = req.user._id;
        const avatar = req.file;
        const { roomId } = req.params;
        const room = await UpdateRoom(userId, roomId, avatar, req.body);
        res.status(200).json({
            success: true,
            message: "Cập nhật phòng thành công",
            data: room,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo phòng",
        });
    }

}
exports.UpdateRoompasswordController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { roomId } = req.params;
        const room = await UpdateRoompassword(userId, roomId, req.body);
        res.status(200).json({
            success: true,
            message: "Cập nhật mật khẩu phòng thành công",
            data: room,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi đổi mật khẩu phòng",
        });
    }

}

