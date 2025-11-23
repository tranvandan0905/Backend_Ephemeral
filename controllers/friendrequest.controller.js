const { createFriendRequest, updateFriendRequest, getSentFriendRequests, getReceivedFriendRequests } = require("../services/friendquest.service");

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
exports.updatefriendrequestController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { friendrequestId } = req.params;
        const friendrequest = await updateFriendRequest(userId, friendrequestId, req.body);
        res.status(201).json(
            {
                success: true,
                data: friendrequest,
                message: "Cập nhật lời mời thành công!"
            }
        )

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi  thêm bạn bè",
        });
    }
}
exports.getSentFriendRequestscontroller = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = await getSentFriendRequests(userId);
    res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
}
exports.getReceivedFriendRequestscontroller = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = await getReceivedFriendRequests(userId);
    res.status(200).json(data);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server ",
        });
    }
}