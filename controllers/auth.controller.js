const jwt = require("jsonwebtoken");
const User = require('../models/user.model');
const bcrypt = require("bcryptjs");
const googleCallback = (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      displayName: req.user.displayName,
      email: req.user.email,
      roles: req.user.roles,
    };

    const token = jwt.sign(
      { _id: user._id, roles: user.roles, displayName: user.displayName, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.send(`
      <script>
        window.opener.postMessage(${JSON.stringify(
      { user }
    )}, "*");
        window.close();
      </script>
    `);
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Thiếu thông tin đăng nhập!" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Sai mật khẩu!" });
    const token = jwt.sign(
      { _id: user._id, roles: user.roles, displayName: user.displayName, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.status(201).json({
      success: true,
      message: "Đăng nhập thành công",
      data: user,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { googleCallback, loginController };
