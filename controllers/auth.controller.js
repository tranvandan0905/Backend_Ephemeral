const jwt = require("jsonwebtoken");
const googleCallback = (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user._id, roles: req.user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
      res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.redirect("http://localhost:3000/auth/success");
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  googleCallback,
};
