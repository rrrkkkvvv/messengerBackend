const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const { User } = require("../models/User.js");

const getUserById = async (id) => {
  return await User.findById(id);
};

const getConversations = async (userId) => {
  const otherUsers = await User.find({ _id: { $ne: userId } })
    .lean()
    .select("-password");

  const conversations = await Conversation.find({
    userIds: { $all: [userId] },
    isGroup: false,
  }).lean();

  const lastMessages = {};
  for (const conversation of conversations) {
    const lastMessage = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ sentAt: -1 })
      .lean();
    const otherUserId = conversation.userIds.find(
      (id) => id.toString() !== userId
    );
    if (lastMessage[0]) {
      lastMessages[otherUserId] = {
        ...lastMessage[0],
        seenStatus:
          lastMessage[0].seenIds.length === conversation.userIds.length - 1,
      };
    } else {
      lastMessages[otherUserId] = {
        conversationId: conversation._id,
      };
    }
  }

  const usersWithLastMessage = otherUsers.map((user) => {
    const lastMessage = lastMessages[user._id];
    return {
      ...user,
      type: "single",
      conversationId: lastMessage ? lastMessage.conversationId : null,
      lastMessage: lastMessage ? lastMessage : null,
    };
  });
  const groupsLastMessages = {};
  const groupConversations = await Conversation.find({
    userIds: { $all: [userId] },
    isGroup: true,
  }).lean();
  for (const groupConversation of groupConversations) {
    const lastMessage = await Message.find({
      conversationId: groupConversation._id,
    })
      .sort({ sentAt: -1 })
      .lean();
    if (lastMessage[0]) {
      const sender = await User.findById(lastMessage[0].senderId)
        .lean()
        .select("-password");
      groupsLastMessages[groupConversation._id] = {
        ...lastMessage[0],
        sender,
        seenStatus:
          lastMessage[0].seenIds.length ===
          groupConversation.userIds.length - 1,
      };
    } else {
      groupsLastMessages[groupConversation._id] = {
        conversationId: groupConversation._id,
      };
    }
  }
  const groupConversationsWithLastMessage = groupConversations.map(
    (conversation) => {
      const lastMessage = groupsLastMessages[conversation._id];

      return {
        _id: conversation._id,
        name: conversation.name,
        type: "group",
        userIds: conversation.userIds,
        isGroup: true,
        creatorId: conversation.creatorId,
        lastMessage: lastMessage ? lastMessage : null,
      };
    }
  );

  return [...usersWithLastMessage, ...groupConversationsWithLastMessage];
};
const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};
const updateUserById = async (updatedProfile) => {
  return await User.findByIdAndUpdate(updatedProfile._id, updatedProfile);
};

module.exports = {
  getUserById,
  getConversations,
  deleteUserById,
  updateUserById,
};
