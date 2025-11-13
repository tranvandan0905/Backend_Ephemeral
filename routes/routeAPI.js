const express = require('express');
const passport = require("../config/passport");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { googleCallback, loginController } = require("../controllers/auth.controller");
const { authenticateToken } = require('../middleware/authMiddleware');
const { createRoomController, getRoomByRoomIdController,findRoomController } = require('../controllers/room.controller');
const { createUserController, profileCOntroller } = require('../controllers/user.controller');
const { sendMessage, getMessages } = require('../controllers/message.controller');
const router = express.Router();
// Google login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);
// Room
router.post("/room", authenticateToken,upload.single("avatar"), createRoomController);
router.get("/room", authenticateToken, findRoomController);
router.get("/room/:roomId", getRoomByRoomIdController);
// User
router.post("/register",createUserController);
router.post("/login",loginController)
router.get("/profile",authenticateToken,profileCOntroller)
// Message
router.post("/message",authenticateToken,upload.single("image"),sendMessage)
router.get("/message",authenticateToken,getMessages)
module.exports = router;

