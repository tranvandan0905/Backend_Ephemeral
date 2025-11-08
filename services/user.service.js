const User = require('../models/user.model')
const bcrypt = require("bcryptjs");
const createUser = async (displayName, email, password) => {
    const checkemail = await User.findOne({ email });
    if (checkemail)
        throw new Error("Email đã tồn tại!");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ displayName, email, passwordHash })
    await user.save();
    return user;
}

module.exports = { createUser };