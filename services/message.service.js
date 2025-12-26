const Message = require("../models/message.model");
const Room = require("../models/room.model")
const { uploadToCloudinary } = require("./cloudinary.service");
const { updateLastMessage, share } = require("./conversation.service");
const { findMembershipUserID } = require("./membership.service");
const { findRoomID } = require("./room.service");
const { FindIDUser } = require("./user.service");
const Post = require("../models/post.model");
const handecreateMessage = async (roomId, userId, text, image) => {
    const user = await FindIDUser(userId);
    const room_ID = await findRoomID(roomId);
    const checkuser = await findMembershipUserID(userId, room_ID._id);
    if (!checkuser) {
        throw new Error("Bạn phải tham gia!");
    }
    if (!text && !image) {
        throw new Error("Phải có dữ liệu!");
    }
    let imageUrl = null;
    if (image) {
        const uploadResult = await uploadToCloudinary(image.buffer);
        imageUrl = uploadResult.secure_url;
    }
    const message = new Message({
        roomId: room_ID._id,
        userId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        text: text || null,
        imageUrl: imageUrl || null
    });
    const [savedMessage, _] = await Promise.all([
        message.save(),
        updateLastMessage(room_ID._id, userId, text)
    ]);

    return savedMessage;
};
const findPostID = async (_id) => {
    const result = await Post.findOne({ _id });
    return result;
};
const handecreateMessageShare = async (postId, friendId, userId) => {
    const post = await findPostID(postId);
    const exist = await Room.findOne({
        $or: [
            { participant: userId, createdBy: friendId },
            { participant: friendId, createdBy: userId }
        ]
    });

    const user = await FindIDUser(userId);
    const message = new Message({
        roomId: exist._id,
        userId,
        postId: post._id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        text: post.content,

    });
    const [savedMessage, _] = await Promise.all([
        message.save(),
        share(post._id, userId, exist._id, post.content)
    ]);
    return savedMessage
}
const handegetMessagesByConversation = async (
    roomId,
    page = 1,
    limit = 10
) => {
    const room_ID = await findRoomID(roomId);
    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const skip = (page - 1) * limit;

    const query = {
        roomId: room_ID._id
    };
    const total = await Message.countDocuments(query);

    const messages = await Message.find(query)
        .sort({ createdAt: -1 }) // mới → cũ
        .skip(skip)
        .limit(limit)
        .select(
            "userId postId displayName avatarUrl type text imageUrl createdAt"
        )
        .populate({
            path: "postId",
            select: "userId",
            populate: {
                path: "userId",
                select: "displayName avatarUrl"
            }
        })
        .lean();
    return {
        data: messages,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1
        }
    };
};
module.exports = { handecreateMessage, handecreateMessageShare, handegetMessagesByConversation };

