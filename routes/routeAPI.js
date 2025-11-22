const express = require('express');
const passport = require("../config/passport");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { googleCallback, loginController } = require("../controllers/auth.controller");
const { authenticateToken } = require('../middleware/authMiddleware');
const { createRoomController, getRoomByRoomIdController, findRoomController, UpdateRoomController, UpdateRoompasswordController } = require('../controllers/room.controller');
const { createUserController, profileCOntroller, updateavatarController } = require('../controllers/user.controller');
const { sendMessage, getMessages } = require('../controllers/message.controller');
const { FindMembershipRoomIDController, createMembershipController, findMembershipUserIDController } = require('../controllers/membership.controller');
const { createfriendrequestController } = require('../controllers/friendrequest');

const router = express.Router();
// Google login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);
// Room
router.post("/room", authenticateToken, upload.single("avatar"), createRoomController);
router.get("/room", authenticateToken, findRoomController);
router.get("/room/:roomId", getRoomByRoomIdController);
router.patch("/room/:roomId", authenticateToken, upload.single("avatar"), UpdateRoomController);
router.patch("/roompassword/:roomId", authenticateToken, UpdateRoompasswordController);
// User
router.post("/register", createUserController);
router.post("/login", loginController)
router.get("/profile", authenticateToken, profileCOntroller)
router.patch("/avatar", authenticateToken, upload.single("avatarUrl"), updateavatarController)
// Message
router.post("/message", authenticateToken, upload.single("image"), sendMessage)
router.get("/message/:roomId", authenticateToken, getMessages)
// Membership
router.get("/membership/:roomId", authenticateToken, FindMembershipRoomIDController)
router.post("/membership", authenticateToken, createMembershipController)
router.get("/checkmembership/:roomId",authenticateToken,findMembershipUserIDController)
//friend
router.post("/friendrequest",authenticateToken,createfriendrequestController)

module.exports = router;

