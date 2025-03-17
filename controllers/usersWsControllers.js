const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const { User } = require("../models/User.js");

const getUserById = async (id) => {
  return await User.findById(id);
};

const getOtherUsers = async (userId) => {
  const otherUsers = await User.find({ _id: { $ne: userId } });

  const conversations = await Conversation.find({
    userIds: { $all: [userId] },
  });

  const lastMessages = {};
  for (const conversation of conversations) {
    const lastMessage = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ sentAt: -1 })
      .select(
        "_id messageText messageImage sentAt senderId conversationId seenIds"
      )
      .lean();

    if (lastMessage[0]) {
      const otherUserId = conversation.userIds.find(
        (id) => id.toString() !== userId
      );

      if (otherUserId) {
        const unreadMessagesCount = await Message.find({
          conversationId: conversation._id,
          $ne: {
            senderId: userId,
            seenIds: { $all: [userId] },
          },
        }).length;
        let seenStatus = false;
        if (
          lastMessage[0].senderId.toString() === userId &&
          lastMessage[0].seenIds[0].toString() === otherUserId.toString()
        ) {
          seenStatus = true;
        }
        lastMessages[otherUserId] = {
          ...lastMessage[0],
          unreadMessagesCount,
          seenStatus,
        };
      }
    }
  }

  const usersWithLastMessage = otherUsers.map((user) => {
    const lastMessage = lastMessages[user._id];

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatarURL: user.avatarURL,
      lastMessage: lastMessage ? lastMessage : null,
    };
  });
  return usersWithLastMessage;
};
const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};
const updateUserById = async (updatedProfile) => {
  return await User.findByIdAndUpdate(updatedProfile._id, updatedProfile);
};

module.exports = {
  getUserById,
  getOtherUsers,
  deleteUserById,
  updateUserById,
};
