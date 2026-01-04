const Message = require("../models/message.model");
const Membership = require("../models/membership.model");
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

    const members = await Membership.find({ roomId: room_ID._id })
        .populate("userId", "_id")
        .populate("roomId", "roomId")
        .lean();

    await message.save();
    await UpdateRoomlastUpdated(roomId, text);

    const friendIds = members
        .map(m => m.userId._id.toString());
    const room = {
        roomId: room_ID.roomId,
        name: room_ID.name || otherUser.displayName,
        avatar: room_ID.avatar || otherUser.avatarUrl,
        text: text || "Chưa có tin nhắn nào!",
        lastUpdated: new Date(),
    };
    return {
        room,
        message,
        friendIds
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
    let otherUser = null;

    // Trường hợp có participant
    if (exist.participant) {
        if (exist.createdBy?._id.toString() === userId.toString()) {
            otherUser = exist.participant;
        } else if (exist.participant?._id.toString() === userId.toString()) {
            otherUser = exist.createdBy;
        }
    } else {
        // Trường hợp chưa có participant
        otherUser = exist.createdBy;
    }
    let text = post.content;
    const room = {
        roomId: exist.roomId,
        name: exist.name || otherUser.displayName,
        avatar: exist.avatar || otherUser.avatarUrl,
        lastUpdated: exist.lastUpdated,
        text: text || "Chưa có tin nhắn nào!",
        lastUpdated: new Date(),
    }
    const savedMessage = await message.save();

    await UpdateRoomlastUpdated(roomId, text);
    await Post.findByIdAndUpdate(
        postId,
        { $inc: { shareCount: 1 } },
        { new: true }
    );

    return {
        room,
        savedMessage
    };

}
const handegetMessagesByConversation = async (
    roomId,
    limit = 10,
    after
) => {
    const room_ID = await findRoomID(roomId);

    const query = {
        roomId: room_ID._id,
    };

    // 👉 lấy TIN CŨ HƠN
    if (after) {
        query.createdAt = { $lt: new Date(after) };
    }

    const messages = await Message.find(query)
        .sort({ createdAt: -1 }) // mới → cũ
        .limit(limit + 1)        // +1 để check còn data không
        .select("userId postId displayName avatarUrl type text imageUrl createdAt")
        .populate({
            path: "postId",
            select: "userId content",
            populate: {
                path: "userId",
                select: "displayName avatarUrl",
            },
        })
        .lean();

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    // ⚠️ cursor = tin CŨ NHẤT
    const nextCursor =
        messages.length > 0
            ? messages[messages.length - 1].createdAt
            : null;

    return {
        data: messages.reverse(), // 👈 cũ → mới (FE dễ append)
        paging: {
            nextCursor: hasMore ? nextCursor : null,
            hasMore,
        },
    };
};


module.exports = { handecreateMessage, handecreateMessageShare, handegetMessagesByConversation };

