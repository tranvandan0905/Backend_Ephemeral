const { createFriendRequest } = require("../services/friendquest.service");

exports.createfriendrequestController = async (req, res) => {
    try {
        const userId = req.user._id;
        const friendrequest = await createFriendRequest(userId, req.body);
        res.status(200).json(
            {
                success: true,
                data: friendrequest,
                message: "Gửi lời mời thành công!"
            }
        )

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi  thêm bạn bè",
        });
    }
}