const { io } = require("../app");
const controllersWrapper = require("../helpers/controllersWrapper");
const { uploadImage } = require("../helpers/uploadImage");
const { Conversation } = require("../models/Conversation");
const {
  createMessage,
  updateMessage: updateMessageService,
  deleteMessage: deleteMessageService,
  checkIsMessageLast,
  getMessageBeforeLast,
  getConversation,
  getOrCreateConversation,
} = require("../services/conversationService");
const {
  kickUserFromConversation,
  addUsersToConversation,
  emitToConversationMembers,
  leaveFromConversation,
  updateGroupConversation,
  sendGroupUpdate,
  deleteConversation,
} = require("../services/conversationService");

const getConversationData = async (req, res) => {
  const { _id, isGroup } = req.body;
  const userId = req.user._id;
  if (!_id) {
    res.status(404).json({ status: "failed" });

    return;
  }
  if (isGroup) {
    const conversation = await getConversation(_id);
    res.status(200).json({ status: "success", data: conversation });
  } else {
    const { status, conversation } = await getOrCreateConversation([
      userId,
      _id,
    ]);

    if (status == "created") {
      conversation.userIds.forEach((_id) => {
        const otherUserId = conversation.userIds.find(
          (otherId) => otherId !== _id
        );
        io.of("/users").to(`user_${_id}`).emit("newConversationWithUser", {
          userId: otherUserId,
          conversationId: conversation._id,
        });
      });
    }
    res.status(200).json({ status: "success", data: conversation });
  }
};
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
const checkIsUserCreator = async ({ userId, conversationId }) => {
  const conversation = await Conversation.findById(conversationId);

  return conversation.creatorId.toString() === userId.toString();
};
const createGroupConversation = async (req, res) => {
  const { name, userIds, creatorId } = req.body;

  const newConversation = await Conversation.create({
    isGroup: true,
    userIds,
    name,
    creatorId,
  });
  // io.of("/users").to(`user_${creatorId}`).emit("newGroupWithUser", {
  //   newConversation,
  // });
  userIds.forEach((userId) => {
    io.of("/users")
      .to(`user_${userId}`)
      .emit("newGroupWithUser", newConversation);
  });
  res.status(201).json({
    code: 201,
    status: "success",
  });
  return newConversation;
};
const updateGroup = async (req, res) => {
  const { creatorId, _id, name } = req.body;

  const userId = req.user._id;
  if (!(await checkIsUserCreator({ userId, conversationId: _id }))) {
    res.status(403).json({
      status: "failed",
      data: { message: "User is not creator of group" },
    });
    return;
  }
  let avatarURL = "";
  if (req.files.avatar) {
    const buffer = req.files.avatar[0].buffer;

    const { secure_url } = await uploadImage(buffer);
    avatarURL = secure_url;
  } else {
    avatarURL = null;
  }
  const updatedGroupInfo = {
    _id,
    name,
    creatorId,
    avatarURL,
  };

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
    isCallInfo: false,
    conversationId,
    messageText,
    senderId: userId,
    messageImage: messageImageUrl,
  };
  const sendedMessage = await createMessage(messageData);

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
    .emit("messageDeleted", { conversationId, messageId });

  res.status(200).json({ status: "success", data: { messageId } });
};
module.exports = {
  getConversationData: controllersWrapper(getConversationData),
  createGroupConversation: controllersWrapper(createGroupConversation),
  addUsers: controllersWrapper(addUsers),
  kickUser: controllersWrapper(kickUser),
  leaveConversation: controllersWrapper(leaveConversation),
  removeConversation: controllersWrapper(removeConversation),
  updateGroup: controllersWrapper(updateGroup),
  sendMessage: controllersWrapper(sendMessage),
  deleteMessage: controllersWrapper(deleteMessage),
  updateMessage: controllersWrapper(updateMessage),
};
