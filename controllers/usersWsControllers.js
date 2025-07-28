const { uploadImage } = require("../helpers/uploadImage.js");
const wsControllersWrapper = require("../helpers/wsControllersWrapper.js");
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
    const lastMessage = await Message.findOne({
      conversationId: conversation._id,
    })
      .sort({ sentAt: -1 })
      .lean();
    const otherUserId = conversation.userIds.find(
      (id) => id.toString() !== userId
    );
    if (lastMessage) {
      lastMessages[otherUserId] = {
        ...lastMessage,
        seenStatus:
          lastMessage.seenIds.length === conversation.userIds.length - 1,
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
    const lastMessage = await Message.findOne({
      conversationId: groupConversation._id,
    })
      .sort({ sentAt: -1 })
      .lean();
    if (lastMessage) {
      const sender = await User.findById(lastMessage.senderId)
        .lean()
        .select("-password");
      groupsLastMessages[groupConversation._id] = {
        ...lastMessage,
        sender,
        seenStatus:
          lastMessage.seenIds.length === groupConversation.userIds.length - 1,
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
        avatarURL: conversation.avatarURL,
        lastMessage: lastMessage ? lastMessage : null,
      };
    }
  );

  return [...usersWithLastMessage, ...groupConversationsWithLastMessage];
};
const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};
const updateUser = async (updatedProfile) => {
  let profile = { ...updatedProfile };
  if (updatedProfile.avatar.fileBuffer.length === 0) {
    profile.avatarURL = null;
  } else if (updatedProfile.avatar.fileBuffer) {
    const buffer = Buffer.from(updatedProfile.avatar.fileBuffer);

    const { secure_url } = await uploadImage(buffer);
    profile.avatarURL = secure_url;
  }
  await User.findByIdAndUpdate(updatedProfile._id, profile);
  return profile;
};

module.exports = {
  getUserById: wsControllersWrapper(getUserById),
  getConversations: wsControllersWrapper(getConversations),
  deleteUserById: wsControllersWrapper(deleteUserById),
  updateUser: wsControllersWrapper(updateUser),
};
