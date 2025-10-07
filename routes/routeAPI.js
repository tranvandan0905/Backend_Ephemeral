const express = require('express');
const passport = require("../config/passport");
const { googleCallback } = require("../controllers/auth.controller");
const router = express.Router();
// Google login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);
module.exports = router;

