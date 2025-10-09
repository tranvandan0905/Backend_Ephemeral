const express = require('express');
const passport = require("../config/passport");
const { googleCallback } = require("../controllers/auth.controller");
const { authenticateToken } = require('../middleware/authMiddleware');
const { createRoomController, getRoomByRoomIdController } = require('../controllers/room.controller');
const router = express.Router();
// Google login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);
// Room
router.post("/room", authenticateToken, createRoomController);
router.get("/room/:roomId", getRoomByRoomIdController);
module.exports = router;

