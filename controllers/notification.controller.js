const { getNotification, CheckNotification, CheckNotificationAll, unreadCountNotification } = require("../services/notification.service");

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
exports.CheckNotificationAllController = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomData = await CheckNotificationAll(userId);
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
          const { id } = req.params;
        const roomData = await CheckNotification(id);
        res.status(200).json(roomData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi server",
        });
    }
};

exports.unreadCountNotificationController = async (req, res) => {
    try {
          const userId = req.user._id;
        const roomData = await unreadCountNotification(userId);
        res.status(200).json(roomData);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi server",
        });
    }
};