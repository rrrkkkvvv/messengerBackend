const {
  getOrCreateConversation,
  sendMessage,
  updateMessage,
  deleteConversation,
  deleteMessage,
  setSeenMessage,
  emitToConversationMembers,
  checkIsMessageLast,
  getMessageBeforeLast,
  sendTypingStatusUpdate,
  getConversation,
  updateGroupConversation,
  sendGroupUpdate,
  kickUserFromConversation,
  isConversationGroup,
  leaveFromConversation,
  addUsersToConversation,
} = require("../controllers/conversationsWsController.js");

const setupConversationsWebSocket = async (socket, io) => {
  const { _id } = socket.user;
  socket.on("joinConversation", async ({ userId, isGroup, conversationId }) => {
    if (isGroup) {
      const conversation = await getConversation(conversationId);

      socket.join(`conversation_${conversation._id}`);
      socket.emit("conversationData", conversation);
    } else {
      const { status, conversation } = await getOrCreateConversation([
        userId,
        _id,
      ]);

      socket.join(`conversation_${conversation._id}`);
      socket.emit("conversationData", conversation);

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
    }
  });

  socket.on(
    "kickUserFromConversation",
    async ({ conversationId, kickedUserId }) => {
      await emitToConversationMembers(
        conversationId,
        io,
        { conversationId, kickedUserId },
        "kickedUserFromConversation"
      );
      await kickUserFromConversation(conversationId, kickedUserId, _id);
    }
  );
  socket.on("addUsersToConversation", async ({ conversationId, users }) => {
    await addUsersToConversation(conversationId, users, _id);
    await emitToConversationMembers(
      conversationId,
      io,
      { conversationId, users },
      "addedUserToConversation"
    );
    const conversation = await getConversation(conversationId);
    users.forEach((userId) => {
      io.of("/users")
        .to(`user_${userId}`)
        .emit("newGroupWithUser", conversation);
    });
  });
  socket.on("leaveFromConversation", async ({ conversationId }) => {
    await emitToConversationMembers(
      conversationId,
      io,
      { conversationId, kickedUserId: _id },
      "kickedUserFromConversation"
    );
    await leaveFromConversation(conversationId, _id);
  });
  socket.on("updateGroupConversation", async ({ updatedGroupInfo }) => {
    await updateGroupConversation(updatedGroupInfo);
    await sendGroupUpdate(io, updatedGroupInfo);
  });
  socket.on("userTyping", async ({ conversationId }) => {
    await sendTypingStatusUpdate(io, conversationId, _id, true);
  });
  socket.on("userStopTyping", async ({ conversationId }) => {
    await sendTypingStatusUpdate(io, conversationId, _id, false);
  });
  socket.on("sendMessage", async ({ conversationId, message }) => {
    const sendedMessage = await sendMessage({
      conversationId,
      message,
      userId: _id,
    });
    socket.emit("newMessage", sendedMessage);
    socket
      .to(`conversation_${conversationId}`)
      .emit("newMessage", sendedMessage);
    await emitToConversationMembers(
      conversationId,
      io,
      {
        message: sendedMessage,
        status: "newLastMessage",
      },
      "lastMessageUpdated"
    );
  });
  socket.on("updateMessage", async ({ conversationId, message }) => {
    const updatedMessage = await updateMessage(message);
    const check = await checkIsMessageLast(message._id, conversationId);
    if (check) {
      await emitToConversationMembers(
        conversationId,
        io,
        {
          message: updatedMessage,
          status: "newLastMessage",
        },
        "lastMessageUpdated"
      );
    }

    socket.emit("messageUpdated", updatedMessage);
    socket
      .to(`conversation_${conversationId}`)
      .emit("messageUpdated", updatedMessage);
  });
  socket.on("deleteMessage", async ({ conversationId, messageId }) => {
    if (await checkIsMessageLast(messageId, conversationId)) {
      const messageBeforeLast = await getMessageBeforeLast(conversationId);
      if (messageBeforeLast) {
        await emitToConversationMembers(
          conversationId,
          io,
          {
            message: messageBeforeLast,
            status: "newLastMessage",
          },
          "lastMessageUpdated"
        );
      } else {
        await emitToConversationMembers(
          conversationId,
          io,
          conversationId,
          "lastMessageReseted"
        );
      }
    }
    await deleteMessage(messageId);
    socket.emit("messageDeleted", messageId);

    socket
      .to(`conversation_${conversationId}`)
      .emit("messageDeleted", messageId);
  });
  socket.on("setSeenMessage", async ({ conversationId, userId, messageId }) => {
    const updatedMessage = await setSeenMessage(userId, messageId);
    if (await checkIsMessageLast(messageId, conversationId)) {
      await emitToConversationMembers(
        conversationId,
        io,
        {
          status: "lastMessageSeen",
          message: { conversationId },
        },

        "lastMessageUpdated"
      );
    }

    socket.emit("messageUpdated", updatedMessage);

    socket
      .to(`conversation_${conversationId}`)
      .emit("messageUpdated", updatedMessage);
  });
  socket.on("deleteConversation", async ({ conversationId }) => {
    const isGroup = await isConversationGroup(conversationId);

    await emitToConversationMembers(
      conversationId,
      io,
      { conversationId, isGroup },
      "conversationDeleted"
    );
    await deleteConversation(conversationId);
  });
  socket.on("leaveConversation", ({ conversationId }) => {
    console.log("leave");
    socket.leave(`conversation_${conversationId}`);
  });
};
module.exports = setupConversationsWebSocket;
