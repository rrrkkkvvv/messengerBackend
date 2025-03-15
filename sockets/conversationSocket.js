const {
  getOrCreateConversation,
  sendMessage,
  updateMessage,
  deleteConversation,
  deleteMessage,
  setSeenMessage,
} = require("../controllers/conversationsWsController");

const setupConversationsWebSocket = async (socket) => {
  const { _id } = socket.user;

  socket.on(
    "joinConversation",
    async ({ userId, isGroup = false, name = "" }) => {
      if (isGroup) {
      } else {
        const conversation = await getOrCreateConversation([userId, _id]);
        socket.join(`conversation_${conversation._id}`);

        socket.emit("conversationData", conversation);
      }
    }
  );

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
  });
  socket.on("updateMessage", async ({ conversationId, message }) => {
    const updatedMessage = await updateMessage(message);
    socket.emit("messageUpdated", updatedMessage);
    socket
      .to(`conversation_${conversationId}`)
      .emit("messageUpdated", updatedMessage);
  });
  socket.on("deleteMessage", async ({ conversationId, messageId }) => {
    await deleteMessage(messageId);
    socket.emit("messageDeleted", messageId);

    socket
      .to(`conversation_${conversationId}`)
      .emit("messageDeleted", messageId);
  });
  socket.on("setSeenMessage", async ({ conversationId, userId, messageId }) => {
    const updatedMessage = await setSeenMessage(userId, messageId);
    socket.emit("messageUpdated", updatedMessage);

    socket
      .to(`conversation_${conversationId}`)
      .emit("messageUpdated", updatedMessage);
  });
  socket.on("deleteConversation", async ({ conversationId }) => {
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
