const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const mongoose = require("mongoose");
const { User } = require("../models/User.js");
const serviceWrapper = require("../helpers/serviceWrapper.js");
const { io } = require("../app.js");
const getConversation = async (conversationId) => {
  const result = await Conversation.aggregate([
    {
      $match: {
        _id:
          typeof conversationId === "string"
            ? new mongoose.Types.ObjectId(conversationId)
            : conversationId,
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { conversationId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$conversationId", "$$conversationId"] },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "senderId",
              foreignField: "_id",
              as: "sender",
              pipeline: [
                {
                  $project: {
                    token: 0,
                    googleId: 0,
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$sender",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: "messages",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "userIds",
        foreignField: "_id",
        as: "members",
      },
    },
  ]);
  const conversation = result[0];
  const lastMessage = await Message.find({
    conversationId: conversation._id,
  })
    .sort({ sentAt: -1 })
    .lean();

  if (lastMessage[0]) {
    conversation.lastMessage = {
      ...lastMessage[0],
      seenStatus:
        lastMessage[0].seenIds.length === conversation.userIds.length - 1,
    };
  } else {
    conversation.lastMessage = {
      conversationId: conversation._id,
    };
  }
  return conversation;
};

const getOrCreateConversation = async (membersArray) => {
  const conversation = await Conversation.findOne({
    userIds: { $all: membersArray },
    isGroup: false,
  });
  if (conversation) {
    const res = await getConversation(conversation._id);

    return { status: "exists", conversation: res };
  } else {
    const newConversation = await Conversation.create({
      isGroup: false,
      userIds: membersArray,
    });
    const res = await getConversation(newConversation._id);

    return { status: "created", conversation: res };
  }
};

const createMessage = async (messageData) => {
  const newMessage = await Message.create(messageData);

  const cleanMessage = newMessage.toObject();
  const sender = await User.findById(newMessage.senderId)
    .lean()
    .select(["-password", "-token", "-googleId", "-createdAt", "-updatedAt"]);
  await sendMessage({ ...cleanMessage, sender });
  return {
    ...cleanMessage,
    sender,
  };
};
const sendMessage = async (message) => {
  await emitToConversationMembers(
    message.conversationId,

    {
      message,
      status: "newLastMessage",
    },
    "lastMessageUpdated"
  );
  io.of("conversations")
    .to(`conversation_${message.conversationId}`)
    .emit("newMessage", message);
};

const deleteMessage = async (messageId) => {
  await Message.findByIdAndDelete(messageId);
};
const getConversationMembersIds = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId).lean();
  if (conversation.isGroup) {
    return [...conversation.userIds, conversation.ownerId];
  } else {
    return conversation.userIds;
  }
};

const kickUserFromConversation = async (
  conversationId,
  kickedUserId,
  currentUserId
) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation.isGroup && conversation.creatorId !== currentUserId) return;
  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { userIds: kickedUserId },
  });
};
const addUsersToConversation = async (conversationId, users, currentUserId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation.isGroup && conversation.creatorId !== currentUserId) return;
  await Conversation.findByIdAndUpdate(conversationId, {
    $push: { userIds: { $each: users } },
  });
};
const leaveFromConversation = async (conversationId, currentUserId) => {
  await Conversation.findByIdAndUpdate(conversationId, {
    $pull: { userIds: currentUserId },
  });
};
const updateMessage = async (messageData) => {
  const updatedMessage = await Message.findByIdAndUpdate(
    messageData._id,
    { ...messageData, $set: { editedAt: new Date() } },
    {
      new: true,
    }
  ).lean();
  const sender = await User.findById(updatedMessage.senderId)
    .lean()
    .select(["-password", "-token", "-googleId", "-createdAt", "-updatedAt"]);
  await sendMessageUpdates({ ...updatedMessage, sender });
  return { ...updatedMessage, sender };
};
const sendMessageUpdates = async (updatedMessage) => {
  const isLast = await checkIsMessageLast(
    updatedMessage._id,
    updatedMessage.conversationId
  );
  if (isLast) {
    await emitToConversationMembers(
      updatedMessage.conversationId,

      {
        message: updatedMessage,
        status: "newLastMessage",
      },
      "lastMessageUpdated"
    );
  }

  io.of("conversations")
    .to(`conversation_${updatedMessage.conversationId}`)
    .emit("messageUpdated", updatedMessage);
};
const checkIsMessageLast = async (_id, conversationId) => {
  const lastMessage = await Message.find({ conversationId })
    .sort({
      sentAt: -1,
    })
    .limit(1)
    .lean();

  if (lastMessage[0]._id.toString() === _id.toString()) {
    return true;
  }
  return false;
};
const setSeenMessage = async (userId, messageId) => {
  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        seenIds: userId,
      },
    },
    { new: true }
  );
  return updatedMessage;
};
const updateGroupConversation = async (updatedGroupInfo) => {
  await Conversation.findByIdAndUpdate(updatedGroupInfo._id, updatedGroupInfo);
  return updatedGroupInfo;
};
const deleteConversation = async (conversationId) => {
  await Conversation.findByIdAndDelete(conversationId);
};
const emitToConversationMembers = async (
  conversationId,

  sendData,
  title
) => {
  const membersIds = await getConversationMembersIds(conversationId);

  membersIds.forEach((_id) => {
    io.of("/users").to(`user_${_id}`).emit(title, sendData);
  });
};
const sendGroupUpdate = async (io, updatedGroupInfo) => {
  const membersIds = await getConversationMembersIds(updatedGroupInfo._id);

  membersIds.forEach((_id) => {
    io.of("/users")
      .to(`user_${_id}`)
      .emit("groupConversationUpdated", updatedGroupInfo);
  });
};
const sendTypingStatusUpdate = async (
  io,
  conversationId,
  userId,
  typingStatus
) => {
  const membersIds = await getConversationMembersIds(conversationId);

  membersIds.forEach((_id) => {
    io.of("/users")
      .to(`user_${_id}`)
      .emit("userTypingStatusUpdate", { conversationId, userId, typingStatus });
  });
};
const getMessageBeforeLast = async (conversationId) => {
  const beforeLastMessage = await Message.find({ conversationId })
    .sort({ sentAt: -1 })
    .lean();
  if (beforeLastMessage[1]) {
    const sender = await User.findById(beforeLastMessage[1].senderId)
      .lean()
      .select(["-password", "-token", "-googleId", "-createdAt", "-updatedAt"]);
    return { ...beforeLastMessage[1], sender };
  } else {
    return null;
  }
};
const isConversationGroup = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  return conversation.isGroup;
};

module.exports = {
  isConversationGroup: serviceWrapper(isConversationGroup),
  leaveFromConversation: serviceWrapper(leaveFromConversation),
  sendGroupUpdate: serviceWrapper(sendGroupUpdate),
  updateGroupConversation: serviceWrapper(updateGroupConversation),
  createMessage: serviceWrapper(createMessage),
  getOrCreateConversation: serviceWrapper(getOrCreateConversation),
  deleteMessage: serviceWrapper(deleteMessage),
  updateMessage: serviceWrapper(updateMessage),
  deleteConversation: serviceWrapper(deleteConversation),
  setSeenMessage: serviceWrapper(setSeenMessage),
  emitToConversationMembers: serviceWrapper(emitToConversationMembers),
  checkIsMessageLast: serviceWrapper(checkIsMessageLast),
  getMessageBeforeLast: serviceWrapper(getMessageBeforeLast),
  sendTypingStatusUpdate: serviceWrapper(sendTypingStatusUpdate),
  getConversation: serviceWrapper(getConversation),
  kickUserFromConversation: serviceWrapper(kickUserFromConversation),
  addUsersToConversation: serviceWrapper(addUsersToConversation),
};
