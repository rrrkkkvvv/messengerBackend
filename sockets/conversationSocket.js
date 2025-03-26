const {
  getOrCreateConversation,
  sendMessage,
  updateMessage,
  deleteConversation,
  deleteMessage,
  setSeenMessage,
  getConversationMembersIds,
  sendLastMessageUpdate,
  checkIsMessageLast,
  getMessageBeforeLast,
  sendTypingStatusUpdate,
} = require("../controllers/conversationsWsController.js");

const setupConversationsWebSocket = async (socket, io) => {
  const { _id } = socket.user;

  socket.on(
    "joinConversation",
    async ({ userId, isGroup = false, name = "" }) => {
      if (isGroup) {
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
    }
  );
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
    await sendLastMessageUpdate(conversationId, io, sendedMessage);
  });
  socket.on("updateMessage", async ({ conversationId, message }) => {
    const updatedMessage = await updateMessage(message);
    const check = await checkIsMessageLast(message._id, conversationId);
    if (check) {
      await sendLastMessageUpdate(conversationId, io, updatedMessage);
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
        await sendLastMessageUpdate(conversationId, io, messageBeforeLast);
      } else {
        await sendLastMessageUpdate(
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
      await sendLastMessageUpdate(conversationId, io, {
        conversationId,
        seenStatus: true,
      });
    }

    socket.emit("messageUpdated", updatedMessage);

    socket
      .to(`conversation_${conversationId}`)
      .emit("messageUpdated", updatedMessage);
  });
  socket.on("deleteConversation", async ({ conversationId }) => {
    await sendLastMessageUpdate(conversationId, io, { conversationId });
    await deleteConversation(conversationId);
    socket.emit("conversationDeleted", conversationId);
    socket
      .to(`conversation_${conversationId}`)
      .emit("conversationDeleted", conversationId);
  });
  socket.on("leaveConversation", ({ conversationId }) => {
    console.log("leave");
    socket.leave(`conversation_${conversationId}`);
  });
};
module.exports = setupConversationsWebSocket;
