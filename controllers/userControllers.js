const { io } = require("../app.js");
const controllersWrapper = require("../helpers/controllersWrapper.js");
const { streamUpload } = require("../helpers/streamUpload.js");
const serviceWrapper = require("../helpers/serviceWrapper.js");
const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const { User } = require("../models/User.js");

const getUserById = async (id) => {
  return await User.findById(id);
};

const getConversations = async (userId) => {
  const otherUsers = await User.find({ _id: { $ne: userId } })
    .lean()
    .select(["-password", "-token", "-googleId", "-createdAt", "-updatedAt"]);

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
      (id) => id.toString() !== userId.toString()
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
    const lastMessage = lastMessages[user._id.toString()];
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
        .select(["-password", "-token", "-googleId"]);
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

const deleteAccount = async (req, res) => {
  const { _id } = req.user;
  const result = await deleteUserById(_id);
  if (!result) {
    throw HttpError(400, "Account was not deleted");
  }

  if (await getUserById(_id)) {
    throw HttpError(400, "Account was not deleted");
  }
  io.of("/users").emit("userDeleted", _id);
  res.status(200).json({
    code: 200,
    status: "success",
  });
};
const updateProfile = async (req, res) => {
  const { _id } = req.user;
  const { updatedName } = req.body;
  const profile = {};
  profile._id = _id;
  if (updatedName) {
    profile.name = updatedName;
  }
  if (req.files.updatedAvatar) {
    const buffer = req.files.updatedAvatar[0].buffer;

    const { secure_url } = await streamUpload(buffer, "image");

    profile.avatarURL = secure_url;
  } else {
    profile.avatarURL = null;
  }
  await User.findByIdAndUpdate(_id, profile).lean();

  io.of("/users").emit("userUpdated", {
    ...profile,
  });
  res.status(200).json({
    code: 200,
    status: "success",
    data: {
      ...profile,
    },
  });
};

module.exports = {
  getUserById: serviceWrapper(getUserById),
  getConversations: serviceWrapper(getConversations),
  deleteAccount: controllersWrapper(deleteAccount),
  updateProfile: controllersWrapper(updateProfile),
};
