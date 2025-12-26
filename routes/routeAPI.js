const express = require('express');
const passport = require("../config/passport");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { googleCallback, loginController } = require("../controllers/auth.controller");
const { authenticateToken } = require('../middleware/authMiddleware');
const { createRoomController, getRoomByRoomIdController, findRoomController, UpdateRoomController, UpdateRoompasswordController } = require('../controllers/room.controller');
const { createUserController, profileCOntroller, updateavatarController, searchUserController, updateUserAboutController } = require('../controllers/user.controller');
const { sendMessage, getMessages } = require('../controllers/message.controller');
const { FindMembershipRoomIDController, createMembershipController, findMembershipUserIDController, createMembershipfriendController, deleteMembershipController } = require('../controllers/membership.controller');
const { createfriendrequestController, updatefriendrequestController, getSentFriendRequestscontroller, getReceivedFriendRequestscontroller } = require('../controllers/friendrequest.controller');
const { deleteFriendcontroller, getFriendcontroller } = require('../controllers/friends.controller');
const { createPostController, getPostByUserIdController, getPostController, getfindPostController } = require('../controllers/post.controller');
const { getLike, postlike, deletelike, findlike } = require('../controllers/like.controller');
const { getComments, createComment, deleteComment } = require('../controllers/comment.controller');
const { shareController } = require('../controllers/share.controller');

const router = express.Router();
// Google login
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);
// Room
router.post("/room", authenticateToken, upload.single("avatar"), createRoomController);
router.get("/room", authenticateToken, findRoomController);
router.get("/room/:roomId", authenticateToken,getRoomByRoomIdController);
router.patch("/room/:roomId", authenticateToken, upload.single("avatar"), UpdateRoomController);
router.patch("/roompassword/:roomId", authenticateToken, UpdateRoompasswordController);
// User
router.get("/search", authenticateToken,searchUserController);
router.post("/register", createUserController);
router.post("/login", loginController)
router.get("/profile", authenticateToken, profileCOntroller)
router.patch("/avatar", authenticateToken, upload.single("avatarUrl"), updateavatarController)
router.put("/about",authenticateToken,updateUserAboutController);

// Message
router.post("/message", authenticateToken, upload.single("image"), sendMessage)
router.get("/message/:roomId", authenticateToken, getMessages)
// Share
router.post("/share", authenticateToken, shareController)
// Membership
router.get("/membership/:roomId", authenticateToken, FindMembershipRoomIDController)
router.post("/membership", authenticateToken, createMembershipController)
router.delete("/membership/:roomId", authenticateToken, deleteMembershipController)
router.post("/membershipfriend", authenticateToken, createMembershipfriendController)
router.get("/checkmembership/:roomId",authenticateToken,findMembershipUserIDController)
//friend
router.post("/friendrequest",authenticateToken,createfriendrequestController)
router.patch("/friendrequest/:friendrequestId",authenticateToken,updatefriendrequestController)

router.delete("/friend/:friendId",authenticateToken,deleteFriendcontroller)
router.get("/friend", authenticateToken, getFriendcontroller)


router.get("/sentfriend", authenticateToken, getSentFriendRequestscontroller)
router.get("/receivedfriend", authenticateToken, getReceivedFriendRequestscontroller)
// Post
router.post("/post",authenticateToken,createPostController)
router.get("/postuser", authenticateToken, getPostByUserIdController)
router.get("/post", authenticateToken, getPostController)
router.get("/findpost/:postId", authenticateToken, getfindPostController)
// Like
router.get('/like/:postId',authenticateToken, getLike);
router.post('/like',authenticateToken, postlike);
router.delete('/like/:postId',authenticateToken, deletelike);
router.post('/like/check', authenticateToken, findlike);
// Comment 
router.get("/comment/:postId", authenticateToken,getComments);
router.post("/comment", authenticateToken,createComment);
router.delete("/comment/:commentId", authenticateToken,deleteComment);
module.exports = router;

