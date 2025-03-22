const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");

const getConversation = async (conversationId) => {
  const result = await Conversation.aggregate([
    { $match: { _id: conversationId } },
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "conversationId",
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
const sendMessage = async ({ conversationId, message, userId }) => {
  const newMessage = await Message.create({
    senderId: userId,
    conversationId,
    messageImage: message.messageImage,
    messageText: message.messageText,
  });

  return newMessage;
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
  return updatedMessage;
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
    io.of("/users").to(`user_${_id}`).emit("lastMessageUpdated", sendData);
  });
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
};
