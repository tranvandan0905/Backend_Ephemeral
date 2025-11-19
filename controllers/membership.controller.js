const { FindMembershipRoomID, createMembership } = require("../services/membership.service");

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
exports.createMembershipController = async (req, res) => {
    try {
        const userId = req.user._id;
        const {roomId,password}=req.body;
        const Membership = await createMembership(userId,roomId,password);
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