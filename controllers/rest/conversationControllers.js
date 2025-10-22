const { io } = require("../../app");
const controllersWrapper = require("../../helpers/controllersWrapper");
const { uploadImage } = require("../../helpers/uploadImage");
const { Conversation } = require("../../models/Conversation");
const {
  sendMessage: sendMessageService,
  updateMessage: updateMessageService,
  deleteMessage: deleteMessageService,
  checkIsMessageLast,
  getMessageBeforeLast,
} = require("../socket/conversationWsController");
const {
  kickUserFromConversation,
  addUsersToConversation,
  emitToConversationMembers,
  leaveFromConversation,
  updateGroupConversation,
  sendGroupUpdate,
  deleteConversation,
} = require("../socket/conversationWsController");

const kickUser = async (req, res) => {
  const { conversationId, kickedUserId } = req.body;
  const userId = req.user._id;

  await kickUserFromConversation(conversationId, kickedUserId, userId);
  await emitToConversationMembers(
    conversationId,
    { conversationId, kickedUserId },
    "kickedUserFromConversation"
  );

  res.status(200).json({ status: "success" });
};

const addUsers = async (req, res) => {
  const { conversationId, users } = req.body;
  const userId = req.user._id;

  await addUsersToConversation(conversationId, users, userId);

  await emitToConversationMembers(
    conversationId,
    { conversationId, users },
    "addedUserToConversation"
  );

  res.status(200).json({ status: "success" });
};

const leaveConversation = async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.user._id;

  await emitToConversationMembers(
    conversationId,
    { conversationId, kickedUserId: userId },
    "kickedUserFromConversation"
  );

  await leaveFromConversation(conversationId, userId);

  res.status(200).json({ status: "success" });
};

const updateGroup = async (req, res) => {
  const updatedGroupInfo = req.body;

  const result = await updateGroupConversation(updatedGroupInfo);
  await sendGroupUpdate(io, result);

  res.status(200).json({ status: "success", data: result });
};

const removeConversation = async (req, res) => {
  const { conversationId } = req.body;

  const isGroup = (await Conversation.findById(conversationId)).isGroup;

  await emitToConversationMembers(
    conversationId,
    { conversationId, isGroup },
    "conversationDeleted"
  );

  await deleteConversation(conversationId);

  res.status(200).json({ status: "success" });
};
const sendMessage = async (req, res) => {
  const { conversationId, messageText } = req.body;
  const userId = req.user._id;
  let messageImageUrl = "";
  if (req.files.messageImage) {
    const buffer = req.files.messageImage[0].buffer;

    const { secure_url } = await uploadImage(buffer);
    messageImageUrl = secure_url;
  }
  const messageData = {
    conversationId,
    messageText,
    senderId: userId,
    messageImage: messageImageUrl,
  };
  const sendedMessage = await sendMessageService(messageData);
  await emitToConversationMembers(
    conversationId,

    {
      message: sendedMessage,
      status: "newLastMessage",
    },
    "lastMessageUpdated"
  );
  io.of("conversations")
    .to(`conversation_${conversationId}`)
    .emit("newMessage", { ...sendedMessage });

  res.status(201).json({
    status: "success",
    data: sendedMessage,
  });
};

const updateMessage = async (req, res) => {
  const { conversationId, messageText, messageId } = req.body;

  let messageImageUrl = "";
  if (req.files.messageImage) {
    const buffer = req.files.messageImage[0].buffer;

    const { secure_url } = await uploadImage(buffer);
    messageImageUrl = secure_url;
  }
  const messageData = {
    _id: messageId,
    conversationId,
    messageText,
    messageImage: messageImageUrl,
  };

  const updatedMessage = await updateMessageService(messageData);

  const isLast = await checkIsMessageLast(updatedMessage._id, conversationId);
  if (isLast) {
    await emitToConversationMembers(
      conversationId,

      {
        message: updatedMessage,
        status: "newLastMessage",
      },
      "lastMessageUpdated"
    );
  }

  io.of("conversations")
    .to(`conversation_${conversationId}`)
    .emit("messageUpdated", updatedMessage);

  res.status(200).json({
    status: "success",
    data: updatedMessage,
  });
};

const deleteMessage = async (req, res, next) => {
  const { conversationId, messageId } = req.body;
  if (await checkIsMessageLast(messageId, conversationId)) {
    const messageBeforeLast = await getMessageBeforeLast(conversationId);
    if (messageBeforeLast) {
      await emitToConversationMembers(
        conversationId,
        {
          message: messageBeforeLast,
          status: "newLastMessage",
        },

        "lastMessageUpdated"
      );
    } else {
      await emitToConversationMembers(
        conversationId,

        conversationId,
        "lastMessageReseted"
      );
    }
  }

  await deleteMessageService(messageId);

  io.of("conversations")
    .to(`conversation_${conversationId}`)
    .emit("messageDeleted", messageId);

  res.status(200).json({ status: "success", data: { messageId } });
};
module.exports = {
  addUsers: controllersWrapper(addUsers),
  kickUser: controllersWrapper(kickUser),
  leaveConversation: controllersWrapper(leaveConversation),
  removeConversation: controllersWrapper(removeConversation),
  updateGroup: controllersWrapper(updateGroup),
  sendMessage: controllersWrapper(sendMessage),
  deleteMessage: controllersWrapper(deleteMessage),
  updateMessage: controllersWrapper(updateMessage),
};
