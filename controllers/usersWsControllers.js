const { Conversation } = require("../models/Conversation");
const { Message } = require("../models/Message");
const { User } = require("../models/User");

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
      .select("_id messageText messageImage sentAt senderId conversationId")
      .lean();

    if (lastMessage[0]) {
      const otherUserId = conversation.userIds.find(
        (id) => id.toString() !== userId
      );

      if (otherUserId) {
        lastMessages[otherUserId] = lastMessage[0];
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
