const Message = require("../models/message.model");
const { uploadToCloudinary } = require("./cloudinary.service");
const { findMembershipUserID } = require("./membership.service");
const { findRoomID, UpdateRoomlastUpdated } = require("./room.service");
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
    if (!room_ID) return null;

    let otherUser = null;

    // Trường hợp có participant
    if (room_ID.participant) {
      if (room_ID.createdBy?._id.toString() === userId.toString()) {
        otherUser = room_ID.participant;
      } else if (room_ID.participant?._id.toString() === userId.toString()) {
        otherUser = room_ID.createdBy;
      }
    } else {
      // Trường hợp chưa có participant
      otherUser = room_ID.createdBy;
    }
    const room = {
        roomId: room_ID.roomId,
        name: room_ID.name || otherUser.displayName,
        avatar: room_ID.avatar || otherUser.avatarUrl,
        lastUpdated: room_ID.lastUpdated,
        text: text || "Chưa có tin nhắn nào!",
        lastUpdated: new Date(),
    }
    await UpdateRoomlastUpdated(roomId, text);
    await message.save();

    return {
        room,
        message
    };


};
const findPostID = async (_id) => {
    const result = await Post.findOne({ _id });
    return result;
};
const handecreateMessageShare = async (postId, userId, roomId) => {
    const post = await findPostID(postId);
    const exist = await findRoomID(roomId);
    const checkuser = await findMembershipUserID(userId, exist._id);
    if (!checkuser) {
        throw new Error("Bạn phải tham gia!");
    }
    const user = await FindIDUser(userId);
    const message = new Message({
        roomId: exist._id,
        userId,
        postId: post._id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,


    });
    const savedMessage = await message.save();
    let text = "Đã chia sẻ một bài viết";
    await UpdateRoomlastUpdated(roomId, text);
    await Post.findByIdAndUpdate(
        postId,
        { $inc: { shareCount: 1 } },
        { new: true }
    );

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
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
            "userId postId displayName avatarUrl type text imageUrl createdAt"
        )
        .populate({
            path: "postId",
            select: "userId content ",
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

