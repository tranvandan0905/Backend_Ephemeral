const jwt = require("jsonwebtoken");

const googleCallback = (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      displayName: req.user.displayName,
      email: req.user.email,
      roles: req.user.roles,
    };

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
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
      window.opener.postMessage(${JSON.stringify({ user })}, "*");
      window.close();
    </script>
  `);
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { googleCallback };
