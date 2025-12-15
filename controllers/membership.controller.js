const { FindMembershipRoomID, createMembership, findMembershipUserID } = require("../services/membership.service");
const { findRoomID } = require("../services/room.service");

exports.FindMembershipRoomIDController = async (req, res) => {
    try {
        const { roomId } = req.params;
          const userId = req.user._id;
        if (!roomId) {
            throw new Error("Thiếu dữ liệu!")
        }
        const membership = await FindMembershipRoomID(roomId,userId);
        res.status(200).json(membership)

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi server khi tạo user",
        });
    }

}
exports.createMembershipController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { roomId, password } = req.body;
        const Membership = await createMembership(userId, roomId, password);
        res.status(201).json({
            success: true,
            message: "Tham gia thành công",
            data: Membership,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tham gia phòng",
        });
    }
};
exports.findMembershipUserIDController = async (req, res) => {
    try {
        const userId = req.user._id;
    
        const roomId= await findRoomID(req.params.roomId)
        const Membership = await findMembershipUserID(userId, roomId._id);
        let check = false;
        if (Membership) {
            check = true;
        }

        res.status(201).json(check);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tham gia phòng",
        });
    }
};
