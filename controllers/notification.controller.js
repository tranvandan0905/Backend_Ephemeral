const { getNotification, CheckNotification } = require("../services/notification.service");

exports.getNotificationController = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomData = await getNotification(userId);
        res.status(200).json(roomData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi server",
        });
    }
};
exports.CheckNotificationController = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomData = await CheckNotification(userId);
        res.status(200).json(roomData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi server",
        });
    }
};