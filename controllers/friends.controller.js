const { deleteFriend, getFriend, CheckFriendAddRoom } = require("../services/friends.service");

exports.deleteFriendcontroller = async (req, res) => {
    try {
        const friendId = req.params.friendId;
        const friend = await deleteFriend(friendId);
        res.status(201).json({
            success: true,
            message: "xóa thành công",
            data: friend,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi xóa",
        });
    }
}
exports.getFriendcontroller = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page, limit, displayName } = req.query;
        const data = await getFriend(userId, page, limit, displayName);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
}
exports.CheckFriendAddRoomcontroller = async (req, res) => {
    try {
        const { datauser,roomId } = req.body;
      
        const data = await CheckFriendAddRoom(datauser,roomId);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
} 