const {
  createMessage,
  updateMessage,
} = require("../services/conversationService");
const { Conversation } = require("../models/Conversation");
const { Message } = require("../models/Message");
const { usersOnline } = require("./usersSocket");

const setupCallWebSocket = async (socket, io) => {
  const { _id } = socket.user;
  socket.on("joinCallsSocket", () => {
    socket.join(`calls_${_id}`);
  });
  // socket.on("disconnect", () => {
  //   socket.broadcast.emit("callEnded");
  // });
  socket.on("iceCandidate", (data) => {
    io.of("/calls")
      .to(`calls_${data.to}`)
      .emit("iceCandidate", {
        ...data,
      });
  });
  socket.on("callUser", async ({ conversationId, to, from, sdp }) => {
    const callMessageData = {
      senderId: from._id,
      isCallInfo: true,
      conversationId,
    };
    if (usersOnline.has(to)) {
      callMessageData.isEnded = false;
      callMessageData.isAnswered = false;
      const callInfo = await createMessage(callMessageData);

      io.of("/calls")
        .to(`calls_${from._id}`)
        .emit("newCallMessageId", { callMessageId: callInfo._id });

      io.of("/calls").to(`calls_${to}`).emit("incomingCall", {
        sdp: sdp,
        from: from,
        callMessageId: callInfo._id,
      });
    } else {
      callMessageData.isEnded = true;
      callMessageData.isAnswered = false;

      await createMessage(callMessageData);
      io.of("/calls").to(`calls_${from._id}`).emit("callEnded");
    }
  });
  socket.on("sendSdp", ({ to, from, sdpType, sdp }) => {
    io.of("/calls").to(`calls_${to}`).emit("newSdp", {
      sdp: sdp,
      from: from,
      sdpType: sdpType,
    });
  });
  socket.on("answerCall", async ({ to, from, sdp, callMessageId }) => {
    io.of("/calls")
      .to(`calls_${to}`)
      .emit("callAccepted", { sdp: sdp, from: from });
    const usersIds = [to, from._id];

    await updateMessage({ _id: callMessageId, isAnswered: true });
    usersIds.forEach((_id) => {
      io.of("/calls")
        .to(`calls_${_id}`)
        .emit("callStarted", { startTime: Date.now() });
    });
  });
  socket.on("mediaStateChange", (data) => {
    io.of("/calls").to(`calls_${data.to}`).emit("mediaStateChanged", {
      from: data.from,
      mediaState: data.mediaState,
    });
  });

  socket.on(
    "endCall",
    async ({ callWith, isAnswered, startTime, callMessageId }) => {
      io.of("/calls").to(`calls_${callWith}`).emit("callEnded");
      const endTime = Date.now();
      const duration = isAnswered
        ? Math.floor((endTime - startTime) / 1000)
        : 0;

      await updateMessage({ _id: callMessageId, duration, isEnded: true });
    }
  );
};

module.exports = setupCallWebSocket;
