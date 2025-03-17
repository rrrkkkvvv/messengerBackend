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

    return res;
  } else {
    const newConversation = await Conversation.create({
      isGroup: false,
      userIds: membersArray,
    });
    return await getConversation(newConversation._id);
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
module.exports = {
  sendMessage,
  getOrCreateConversation,
  deleteMessage,
  updateMessage,
  deleteConversation,
  setSeenMessage,
};
