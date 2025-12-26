const { createUser, updateavatar, searchUser, FindIDUser, updateUserAbout } = require("../services/user.service");

exports.createUserController = async (req, res) => {
    try {
        const { displayName, email, password } = req.body;
        if (!displayName || !email || !password)
            throw new Error("Thiếu dữ liệu");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            throw new Error("Email không hợp lệ");
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(password))
            throw new Error("Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ và số");


        const user = await createUser(displayName, email, password);
        res.status(201).json({
            success: true,
            message: "Tạo user thành công",
            data: user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Lỗi server khi tạo user",
        });
    }
};
exports.profileCOntroller = async (req, res) => {
    const profile = req.user._id;
    const user = await FindIDUser(profile);
    res.status(200).json(
        user
    )
}
exports.updateavatarController = async (req, res) => {
    try {
        const avatar = req.file;
        const userId = req.user._id;
        if (!avatar) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn ảnh avatar!",
            });
        }
        const avatarUrl = await updateavatar(userId, avatar);

        return res.status(200).json({
            success: true,
            message: "Cập nhật avatar thành công!",
            data: avatarUrl,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi cập nhật avatar!",
            error: error.message,
        });
    }
};
exports.searchUserController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { keyword } = req.query;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thiếu từ khóa tìm kiếm"
      });
    }

    const users = await searchUser(userId, keyword.trim());

    return res.status(200).json(users);

  } catch (error) {
    console.error("searchUserController error:", error);

    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra",
      error: error.message
    });
  }
};
exports.updateUserAboutController = async (req, res) => {
  try {
    const userId = req.user._id; 


    const result = await updateUserAbout(userId, req.body);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("updateUserAboutController error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Cập nhật thất bại"
    });
  }
};