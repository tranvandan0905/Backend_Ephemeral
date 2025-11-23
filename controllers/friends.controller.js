const { deleteFriend, getFriend } = require("../services/friends.service");

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
        const data = await getFriend(userId);
    res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
}