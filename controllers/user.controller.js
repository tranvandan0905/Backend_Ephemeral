const { createUser } = require("../services/user.service");

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
exports.profileCOntroller=async(req,res)=>{
    const profile=req.user;
    res.status(200).json({
        data:profile
    })
}
