const friendrequest = require("../models/friendrequest.model");
const Friend = require("../models/friends.model");
const { createRoomUser } = require("./room.service");

const createFriend = async (userId1, userId2) => {
    if (userId1 === userId2) throw new Error("Không thể kết bạn với chính mình");

    const exist = await Friend.findOne({
        $or: [
            { userId1: userId1, userId2: userId2 },
            { userId1: userId2, userId2: userId1 } 
        ]
    });
    if (exist) throw new Error("Đã là bạn bè hoặc đã tồn tại");

    const friend = new Friend({ userId1, userId2 });
    await createRoomUser(userId1, userId2);
    await friend.save();
    return friend;
};

const deleteFriend = async (friendId) => {
    const deleted = await Friend.findByIdAndDelete(friendId);
    if (!deleted) throw new Error("Bạn bè không tồn tại");
    return true;
};

const getFriend = async (userId, page = 1, limit = 10,displayName) => {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
        $or: [
            { userId1: userId },
            { userId2: userId }
        ]
    };

    // lấy toàn bộ friend trước (chưa phân trang)
    const friends = await Friend.find(query)
        .populate([
            { path: "userId1", select: "displayName avatarUrl" },
            { path: "userId2", select: "displayName avatarUrl" }
        ])
        .sort({ createdAt: -1 })
        .lean();

    // map ra đúng user là bạn bè
    let mappedFriends = friends.map(f => {
        const friendUser =
            f.userId1._id.toString() === userId.toString()
                ? f.userId2
                : f.userId1;

        return {
            friendId: f._id,
            userId: friendUser._id,
            displayName: friendUser.displayName,
            avatarUrl: friendUser.avatarUrl
        };
    });

    // lọc theo tên nếu có truyền displayName
    if (displayName) {
        const regex = new RegExp(displayName, "i"); // không phân biệt hoa thường
        mappedFriends = mappedFriends.filter(f =>
            regex.test(f.displayName)
        );
    }

    const total = mappedFriends.length;

    // phân trang sau khi filter
    const data = mappedFriends.slice(skip, skip + limit);

    return {
        data,
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



module.exports = { createFriend, deleteFriend, getFriend };
