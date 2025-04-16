const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const mongoose = require("mongoose");
const { User } = require("../models/User.js");
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
  return result[0];
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

const createGroupConversation = async (name, userIds, creatorId) => {
  const newConversation = await Conversation.create({
    isGroup: true,
    userIds,
    name,
    creatorId,
  });
  return newConversation;
};
const sendMessage = async ({ conversationId, message, userId }) => {
  const newMessage = await Message.create({
    senderId: userId,
    conversationId,
    messageImage: message.messageImage,
    messageText: message.messageText,
  });
  const cleanMessage = newMessage.toObject();
  const sender = await User.findById(newMessage.senderId)
    .lean()
    .select("-password");
  return {
    ...cleanMessage,
    sender,
  };
};
const deleteMessage = async (messageId) => {
  await Message.findByIdAndDelete(messageId);
};
const getConversationMembersIds = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId);
  return conversation.userIds;
};
const updateMessage = async (message) => {
  const updatedMessage = await Message.findByIdAndUpdate(
    message._id,
    { ...message, $set: { editedAt: new Date() } },
    {
      new: true,
    }
  );
  const sender = await User.findById(updatedMessage.senderId)
    .lean()
    .select("-password");
  return { ...updatedMessage, sender };
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
const deleteConversation = async (conversationId) => {
  await Conversation.findByIdAndDelete(conversationId);
};
const sendLastMessageUpdate = async (
  conversationId,
  io,
  sendData,
  title = "lastMessageUpdated"
) => {
  const membersIds = await getConversationMembersIds(conversationId);

  membersIds.forEach((_id) => {
    io.of("/users").to(`user_${_id}`).emit(title, sendData);
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
      .select("-password");
    return { ...beforeLastMessage[1], sender };
  } else {
    return null;
  }
};

module.exports = {
  sendMessage,
  getOrCreateConversation,
  deleteMessage,
  updateMessage,
  deleteConversation,
  setSeenMessage,
  sendLastMessageUpdate,
  checkIsMessageLast,
  getMessageBeforeLast,
  sendTypingStatusUpdate,
  createGroupConversation,
  getConversation,
};
