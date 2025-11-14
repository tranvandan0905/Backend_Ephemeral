const { FindMembershipRoomID } = require("../services/membership.service");

exports.FindMembershipRoomIDController = async (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId) {
            throw new Error("Thiếu dữ liệu!")
        }
        const membership = await FindMembershipRoomID(roomId);
        res.status(200).json(membership)

    } catch (error) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo user",
        });
    }

}