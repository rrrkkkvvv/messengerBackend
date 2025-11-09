const {
  getOrCreateConversation,

  setSeenMessage,
  emitToConversationMembers,
  checkIsMessageLast,
  sendTypingStatusUpdate,
  getConversation,
} = require("../services/conversationService");

const setupConversationsWebSocket = async (socket, io) => {
  const { _id } = socket.user;
  // socket.on("joinConversation", async ({ _id }) => {
  //   socket.join(`conversation_${_id}`);
  // });
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
  socket.on("userTyping", async ({ conversationId }) => {
    await sendTypingStatusUpdate(io, conversationId, _id, true);
  });
  socket.on("userStopTyping", async ({ conversationId }) => {
    await sendTypingStatusUpdate(io, conversationId, _id, false);
  });

  socket.on("setSeenMessage", async ({ conversationId, userId, messageId }) => {
    const updatedMessage = await setSeenMessage(userId, messageId);
    if (await checkIsMessageLast(messageId, conversationId)) {
      await emitToConversationMembers(
        conversationId,

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

  socket.on("leaveConversation", ({ conversationId }) => {
    socket.leave(`conversation_${conversationId}`);
  });
};
module.exports = setupConversationsWebSocket;
